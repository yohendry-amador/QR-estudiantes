import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface AttendanceEvent {
  sectionId: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  status: string;
  recordedAt: string;
}

export interface SessionEvent {
  sectionId: string;
  sessionId: string;
  qrCode: string;
  expiresAt: string;
  professorId: string;
}

@Injectable()
export class WebsocketService {
  private readonly logger = new Logger(WebsocketService.name);
  private server: Server | null = null;

  setServer(server: Server): void {
    this.server = server;
  }

  getServer(): Server | null {
    return this.server;
  }

  emitAttendanceRecorded(sectionId: string, data: AttendanceEvent): void {
    if (!this.server) { this.logger.warn('WebSocket server not initialized'); return; }
    this.server.to(`section:${sectionId}`).emit('attendance:recorded', data);
    this.logger.debug(`Emitted attendance:recorded to section:${sectionId}`);
  }

  emitSessionCreated(sectionId: string, data: SessionEvent): void {
    if (!this.server) { this.logger.warn('WebSocket server not initialized'); return; }
    this.server.to(`section:${sectionId}`).emit('session:created', data);
    this.server.to(`professor:${data.professorId}`).emit('session:created', data);
  }

  emitSessionExpired(sectionId: string, sessionId: string, professorId: string): void {
    if (!this.server) { this.logger.warn('WebSocket server not initialized'); return; }
    this.server.to(`section:${sectionId}`).emit('session:expired', { sessionId });
    this.server.to(`professor:${professorId}`).emit('session:expired', { sessionId });
  }

  emitSessionCancelled(sectionId: string, sessionId: string, professorId: string): void {
    if (!this.server) { this.logger.warn('WebSocket server not initialized'); return; }
    this.server.to(`section:${sectionId}`).emit('session:cancelled', { sessionId });
    this.server.to(`professor:${professorId}`).emit('session:cancelled', { sessionId });
  }

  joinSection(socket: Socket, sectionId: string): void {
    socket.join(`section:${sectionId}`);
  }

  leaveSection(socket: Socket, sectionId: string): void {
    socket.leave(`section:${sectionId}`);
  }

  joinProfessor(socket: Socket, professorId: string): void {
    socket.join(`professor:${professorId}`);
  }

  leaveProfessor(socket: Socket, professorId: string): void {
    socket.leave(`professor:${professorId}`);
  }
}