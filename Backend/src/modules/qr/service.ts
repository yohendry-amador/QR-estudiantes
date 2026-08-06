import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { RedisService, QRSessionData } from '../redis/redis.service';
import { WebsocketService } from '../websocket/websocket.service';
import { AuditService } from '../audit/service';
import { SectionsService } from '../sections/service';
import { EnrollmentsService } from '../enrollments/service';
import { AttendanceService } from '../attendance/service';
import { StudentsService } from '../students/service';
import { AttendanceMethod } from '@prisma/client';

export interface QRData {
  sessionId: string;
  studentId: string;
  timestamp: number;
  signature: string;
}

export interface GenerateQRResult {
  sessionId: string;
  qrData: string;
  expiresAt: Date;
  sectionId: string;
}

@Injectable()
export class QrService {
  private readonly logger = new Logger(QrService.name);
  private readonly qrSecretKey: string;
  private readonly defaultTtlSeconds: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly websocketService: WebsocketService,
    private readonly auditService: AuditService,
    private readonly sectionsService: SectionsService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly attendanceService: AttendanceService,
    private readonly studentsService: StudentsService,
  ) {
    this.qrSecretKey = this.configService.get<string>('QR_SECRET_KEY', 'default-qr-secret-key');
    this.defaultTtlSeconds = this.configService.get<number>('QR_EXPIRES_SECONDS', 60);
  }

  async generateQRCode(sectionId: string, professorId: string, durationSeconds?: number): Promise<GenerateQRResult> {
    const ttl = durationSeconds || this.defaultTtlSeconds;
    const expiresAt = new Date(Date.now() + ttl * 1000);

    const session = await this.sectionsService.createSession(sectionId, {
      startTime: new Date(),
      endTime: expiresAt,
    });

    const timestamp = Math.floor(Date.now() / 1000);
    const qrData = this.createQRPayload(session.id, timestamp);
    const decodedQr = this.decodeQRPayload(qrData);
    await this.sectionsService.updateSessionQRCode(session.id, qrData);

    const qrSessionData: QRSessionData = {
      sessionId: session.id,
      sectionId,
      professorId,
      generatedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      signature: decodedQr.signature,
    };

    await this.redisService.setQRSession(session.id, qrSessionData, ttl);

    this.websocketService.emitSessionCreated(sectionId, {
      sectionId,
      sessionId: session.id,
      qrCode: qrData,
      expiresAt: expiresAt.toISOString(),
      professorId,
    });

    await this.auditService.log({
      userId: professorId,
      action: 'GENERATE_QR',
      entityType: 'Session',
      entityId: session.id,
      newValues: { sectionId, ttl },
    });

    this.logger.log(`QR Code generated for section ${sectionId}, session ${session.id}, expires in ${ttl}s`);

    return { sessionId: session.id, qrData, expiresAt, sectionId };
  }

  async validateAndRecordAttendance(qrPayload: string, userId: string): Promise<{ success: boolean; attendanceId?: string; message: string }> {
    let decodedQR: QRData;

    try {
      decodedQR = this.decodeQRPayload(qrPayload);
    } catch {
      throw new BadRequestException('Código QR inválido');
    }

    const { sessionId, signature, timestamp } = decodedQR;

    if (!this.verifyQRSignature(sessionId, '', timestamp, signature)) {
      throw new UnauthorizedException('Firma del código QR inválida');
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - timestamp > 120) {
      throw new BadRequestException('Código QR expirado');
    }

    const qrSession = await this.redisService.getQRSession(sessionId);
    if (!qrSession) {
      throw new BadRequestException('La sesión QR ha expirado o no existe');
    }

    const expiresAt = new Date(qrSession.expiresAt);
    if (expiresAt < new Date()) {
      throw new BadRequestException('La sesión QR ha expirado');
    }

    const student = await this.studentsService.findByUserId(userId);
    if (!student) {
      throw new BadRequestException('El usuario autenticado no tiene perfil de estudiante');
    }

    const studentId = student.id;
    const enrollment = await this.enrollmentsService.findActiveEnrollment(studentId, qrSession.sectionId);
    if (!enrollment) {
      throw new BadRequestException('No estás inscrito en esta sección');
    }

    const hasAttended = await this.attendanceService.hasAttended(studentId, sessionId);
    if (hasAttended) {
      throw new BadRequestException('Ya has registrado tu asistencia para esta sesión');
    }

    const attendance = await this.attendanceService.recordAttendance({
      studentId,
      sessionId,
      sectionId: qrSession.sectionId,
      status: 'PRESENT',
      method: AttendanceMethod.QR_SCAN,
      enrollmentId: enrollment.id,
    });

    await this.auditService.log({
      userId,
      action: 'SCAN_QR',
      entityType: 'Attendance',
      entityId: attendance.id,
      newValues: { sessionId, sectionId: qrSession.sectionId, method: 'QR_SCAN' },
    });

    this.logger.log(`Attendance recorded for student ${studentId} in session ${sessionId}`);

    return { success: true, attendanceId: attendance.id, message: 'Asistencia registrada correctamente' };
  }

  async cancelSession(sessionId: string, professorId: string): Promise<void> {
    const session = await this.sectionsService.closeSession(sessionId);
    await this.redisService.deleteQRSession(sessionId);

    const section = await this.sectionsService.findById(session.sectionId);
    if (section) {
      this.websocketService.emitSessionCancelled(session.sectionId, sessionId, professorId);
    }

    await this.auditService.log({ userId: professorId, action: 'CANCEL_QR_SESSION', entityType: 'Session', entityId: sessionId });
  }

  private createQRPayload(sessionId: string, timestamp: number): string {
    const signature = this.signQRData(sessionId, '', timestamp);
    const payload: QRData = { sessionId, studentId: '', timestamp, signature };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  private decodeQRPayload(qrPayload: string): QRData {
    try {
      const decoded = Buffer.from(qrPayload, 'base64').toString('utf-8');
      return JSON.parse(decoded) as QRData;
    } catch {
      throw new BadRequestException('No se pudo decodificar el código QR');
    }
  }

  private signQRData(sessionId: string, studentId: string, timestamp: number): string {
    const data = `${sessionId}:${studentId}:${timestamp}`;
    return crypto.createHmac('sha256', this.qrSecretKey).update(data).digest('hex');
  }

  private verifyQRSignature(sessionId: string, studentId: string, timestamp: number, signature: string): boolean {
    const expectedSignature = this.signQRData(sessionId, studentId, timestamp);
    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch {
      return false;
    }
  }
}