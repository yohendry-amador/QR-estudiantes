import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [sections, total] = await Promise.all([
      this.prisma.section.findMany({
        skip,
        take: limit,
        include: { course: true, professor: { include: { user: { select: { firstName: true, lastName: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.section.count(),
    ]);
    return { sections, total, page, limit };
  }

  async findById(id: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: { course: true, professor: { include: { user: { select: { firstName: true, lastName: true } } } } },
    });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async getMySections(professorId: string) {
    return this.prisma.section.findMany({
      where: { professorId },
      include: { course: true, _count: { select: { enrollments: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActiveSession(sectionId: string) {
    return this.prisma.session.findFirst({
      where: { sectionId, status: 'ACTIVE' },
      orderBy: { startTime: 'desc' },
    });
  }

  async create(data: { code: string; courseId: string; professorId: string; schedule: string; room: string; semester: string; year: number }) {
    const existing = await this.prisma.section.findFirst({
      where: { courseId: data.courseId, code: data.code, semester: data.semester, year: data.year },
    });
    if (existing) throw new ConflictException('Section already exists for this course/semester/year');
    return this.prisma.section.create({ data, include: { course: true, professor: true } });
  }

  async update(id: string, data: { code?: string; courseId?: string; professorId?: string; schedule?: string; room?: string; semester?: string; year?: number }) {
    return this.prisma.section.update({ where: { id }, data, include: { course: true, professor: true } });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.section.delete({ where: { id } });
    return { success: true };
  }

  async getEnrollments(sectionId: string) {
    return this.prisma.enrollment.findMany({
      where: { sectionId },
      include: { student: { include: { user: { select: { email: true } } } } },
    });
  }

  async getAllEnrollments(sectionId: string) {
    return this.prisma.enrollment.findMany({
      where: { sectionId },
      include: { student: { include: { user: { select: { email: true, isActive: true } } } } },
    });
  }
}