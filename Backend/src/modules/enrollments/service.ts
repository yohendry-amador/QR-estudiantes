import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { studentId: string; sectionId: string }) {
    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_sectionId: { studentId: data.studentId, sectionId: data.sectionId } },
    });

    if (existing) {
      if (existing.status === EnrollmentStatus.ACTIVE) {
        throw new ConflictException('El estudiante ya está inscrito en esta sección');
      }
      return this.prisma.enrollment.update({
        where: { id: existing.id },
        data: { status: EnrollmentStatus.ACTIVE },
      });
    }

    return this.prisma.enrollment.create({
      data: { studentId: data.studentId, sectionId: data.sectionId, status: EnrollmentStatus.ACTIVE },
    });
  }

  async findByStudent(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId, status: EnrollmentStatus.ACTIVE },
      include: { section: { include: { course: true, professor: true } } },
      orderBy: { section: { course: { name: 'asc' } } },
    });
  }

  async findBySection(sectionId: string) {
    return this.prisma.enrollment.findMany({
      where: { sectionId, status: EnrollmentStatus.ACTIVE },
      include: { student: { include: { user: { select: { email: true } } } } },
      orderBy: { student: { lastName: 'asc' } },
    });
  }

  async findAll() {
    return this.prisma.enrollment.findMany({
      include: {
        student: { include: { user: { select: { email: true } } } },
        section: { include: { course: true, professor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveEnrollment(studentId: string, sectionId: string) {
    return this.prisma.enrollment.findFirst({
      where: { studentId, sectionId, status: EnrollmentStatus.ACTIVE },
    });
  }

  async findAll() {
    return this.prisma.enrollment.findMany({
      include: {
        student: { include: { user: { select: { email: true } } } },
        section: { include: { course: true, professor: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}