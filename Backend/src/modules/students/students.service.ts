import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { studentCode: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { email: true, isActive: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { students, total, page, limit };
  }

  async findById(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, isActive: true, role: true } },
        enrollments: {
          include: {
            section: {
              include: {
                course: true,
                professor: { include: { user: { select: { firstName: true, lastName: true } } } },
              },
            },
          },
        },
      },
    });

    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async findByUserId(userId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, isActive: true, role: true } },
        enrollments: {
          include: {
            section: {
              include: {
                course: true,
                professor: { include: { user: { select: { firstName: true, lastName: true } } } },
              },
            },
          },
        },
      },
    });

    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async create(data: { email: string; password: string; studentCode: string; firstName: string; lastName: string }) {
    const existingStudent = await this.prisma.student.findUnique({ where: { studentCode: data.studentCode } });
    if (existingStudent) throw new ConflictException('Student code already exists');

    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('Email already registered');

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.password,
        role: 'STUDENT',
      },
    });

    return this.prisma.student.create({
      data: {
        studentCode: data.studentCode,
        firstName: data.firstName,
        lastName: data.lastName,
        userId: user.id,
      },
      include: { user: { select: { email: true, isActive: true } } },
    });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; studentCode?: string }) {
    if (data.studentCode) {
      const existing = await this.prisma.student.findUnique({ where: { studentCode: data.studentCode } });
      if (existing && existing.id !== id) throw new ConflictException('Student code already in use');
    }

    return this.prisma.student.update({
      where: { id },
      data,
      include: { user: { select: { email: true, isActive: true } } },
    });
  }

  async delete(id: string) {
    const student = await this.findById(id);
    await this.prisma.user.delete({ where: { id: student.userId } });
    return { success: true };
  }

  async getEnrollments(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        section: {
          include: {
            course: true,
            professor: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });
  }

  async getAttendanceSummary(studentId: string) {
    const attendances = await this.prisma.attendance.findMany({
      where: { studentId },
      include: {
        section: { include: { course: true, professor: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        session: { select: { startTime: true, endTime: true } },
      },
    });

    const stats = {
      total: attendances.length,
      present: attendances.filter(a => a.status === 'PRESENT').length,
      absent: attendances.filter(a => a.status === 'ABSENT').length,
      tardy: attendances.filter(a => a.status === 'TARDY').length,
      justified: attendances.filter(a => a.status === 'JUSTIFIED').length,
    };

    stats['attendanceRate'] = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;

    return {
      studentId,
      ...stats,
      attendances: attendances.map(a => ({
        id: a.id,
        status: a.status,
        recordedAt: a.recordedAt,
        section: {
          id: a.section.id,
          code: a.section.code,
          course: { name: a.section.course.name },
          professor: { firstName: a.section.professor.firstName, lastName: a.section.professor.lastName },
        },
      })),
    };
  }
}