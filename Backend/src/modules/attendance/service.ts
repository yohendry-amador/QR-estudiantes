import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketService } from '../websocket/websocket.service';
import { AuditService } from '../audit/service';
import { AttendanceStatus, AttendanceMethod } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly websocketService: WebsocketService,
    private readonly auditService: AuditService,
  ) {}

  async recordAttendance(data: {
    studentId: string;
    sessionId: string;
    sectionId: string;
    status: AttendanceStatus;
    method: AttendanceMethod;
    enrollmentId: string;
    notes?: string;
  }) {
    const existing = await this.prisma.attendance.findUnique({
      where: { studentId_sessionId: { studentId: data.studentId, sessionId: data.sessionId } },
    });

    if (existing) throw new ConflictException('La asistencia ya fue registrada para esta sesión');

    const attendance = await this.prisma.attendance.create({
      data: {
        studentId: data.studentId,
        sessionId: data.sessionId,
        sectionId: data.sectionId,
        status: data.status,
        method: data.method,
        enrollmentId: data.enrollmentId,
        notes: data.notes,
      },
      include: { student: true, session: true },
    });

    this.websocketService.emitAttendanceRecorded(data.sectionId, {
      sectionId: data.sectionId,
      sessionId: data.sessionId,
      studentId: data.studentId,
      studentName: `${attendance.student.firstName} ${attendance.student.lastName}`,
      status: data.status,
      recordedAt: attendance.recordedAt.toISOString(),
    });

    return attendance;
  }

  async findBySession(sessionId: string) {
    return this.prisma.attendance.findMany({
      where: { sessionId },
      include: { student: true },
      orderBy: { recordedAt: 'asc' },
    });
  }

  async findBySection(sectionId: string, params: { startDate?: Date; endDate?: Date; sessionId?: string }) {
    const where: any = { sectionId };
    if (params.sessionId) where.sessionId = params.sessionId;
    if (params.startDate || params.endDate) {
      where.recordedAt = {};
      if (params.startDate) where.recordedAt.gte = params.startDate;
      if (params.endDate) where.recordedAt.lte = params.endDate;
    }
    return this.prisma.attendance.findMany({
      where,
      include: { student: true, session: true },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async findByStudent(studentId: string, params: { startDate?: Date; endDate?: Date }) {
    const where: any = { studentId };
    if (params.startDate || params.endDate) {
      where.recordedAt = {};
      if (params.startDate) where.recordedAt.gte = params.startDate;
      if (params.endDate) where.recordedAt.lte = params.endDate;
    }
    return this.prisma.attendance.findMany({
      where,
      include: { section: { include: { course: true } }, session: true },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: AttendanceStatus, notes?: string) {
    const attendance = await this.prisma.attendance.findUnique({ where: { id } });
    if (!attendance) throw new NotFoundException('Asistencia no encontrada');

    const oldStatus = attendance.status;
    const updated = await this.prisma.attendance.update({
      where: { id },
      data: { status, notes: notes || attendance.notes },
      include: { student: true },
    });

    await this.auditService.log({
      action: 'UPDATE_ATTENDANCE_STATUS',
      entityType: 'Attendance',
      entityId: id,
      oldValues: { status: oldStatus },
      newValues: { status, notes },
    });

    return updated;
  }

  async getAttendanceStats(sectionId: string, sessionId?: string) {
    const where: any = { sectionId };
    if (sessionId) where.sessionId = sessionId;

    const [total, present, absent, tardy, justified] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.PRESENT } }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.ABSENT } }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.TARDY } }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.JUSTIFIED } }),
    ]);

    return { total, present, absent, tardy, justified };
  }

  async hasAttended(studentId: string, sessionId: string): Promise<boolean> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { studentId_sessionId: { studentId, sessionId } },
    });
    return !!attendance;
  }
}