import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { code: string; courseId: string; professorId: string; schedule: string; room: string; semester: string; year: number }) {
    const existing = await this.prisma.section.findFirst({
      where: { courseId: data.courseId, code: data.code, semester: data.semester, year: data.year },
    });
    if (existing) throw new ConflictException('La sección ya existe para este curso, semestre y año');

    return this.prisma.section.create({ data });
  }

  async findById(id: string) {
    return this.prisma.section.findUnique({
      where: { id },
      include: { course: true, professor: true },
    });
  }

  async findAll(params: { skip?: number; take?: number; professorId?: string }) {
    const { skip = 0, take = 50, professorId } = params;
    const where: any = {};
    if (professorId) where.professorId = professorId;

    const [sections, total] = await Promise.all([
      this.prisma.section.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { course: true, professor: true } }),
      this.prisma.section.count({ where }),
    ]);

    return { sections, total };
  }

  async getSectionsByProfessor(professorId: string) {
    return this.prisma.section.findMany({
      where: { professorId },
      include: { course: true, _count: { select: { enrollments: true } } },
      orderBy: { code: 'asc' },
    });
  }

  async getStudents(sectionId: string) {
    return this.prisma.enrollment.findMany({
      where: { sectionId, status: 'ACTIVE' },
      include: { student: { include: { user: { select: { email: true } } } } },
      orderBy: { student: { lastName: 'asc' } },
    });
  }

  async createSession(sectionId: string, data: { startTime: Date; endTime: Date }) {
    const section = await this.prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) throw new NotFoundException('Sección no encontrada');

    await this.prisma.session.updateMany({ where: { sectionId, status: 'ACTIVE' }, data: { status: SessionStatus.CLOSED } });

    return this.prisma.session.create({
      data: { sectionId, startTime: data.startTime, endTime: data.endTime, status: SessionStatus.ACTIVE },
    });
  }

  async getActiveSession(sectionId: string) {
    return this.prisma.session.findFirst({ where: { sectionId, status: SessionStatus.ACTIVE }, orderBy: { createdAt: 'desc' } });
  }

  async updateSessionQRCode(sessionId: string, qrCode: string) {
    return this.prisma.session.update({ where: { id: sessionId }, data: { qrCode } });
  }

  async closeSession(sessionId: string) {
    return this.prisma.session.update({ where: { id: sessionId }, data: { status: SessionStatus.CLOSED } });
  }
}