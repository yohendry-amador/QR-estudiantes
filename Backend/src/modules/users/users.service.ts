import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { student: { firstName: { contains: search, mode: 'insensitive' as const } } },
            { student: { lastName: { contains: search, mode: 'insensitive' as const } } },
            { professor: { firstName: { contains: search, mode: 'insensitive' as const } } },
            { professor: { lastName: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: { select: { firstName: true, lastName: true, studentCode: true } },
          professor: { select: { firstName: true, lastName: true, employeeCode: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        professor: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, data: { email?: string; isActive?: boolean; role?: string }) {
    if (data.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: { student: true, professor: true },
    });
  }

  async create(data: { email: string; password: string; role: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: { email: data.email, passwordHash, role: data.role as any },
      include: { student: true, professor: true },
    });

    if (data.role === 'STUDENT') {
      await this.prisma.student.create({
        data: {
          userId: user.id,
          studentCode: `STU${Date.now()}`,
          firstName: 'New',
          lastName: 'Student',
        },
      });
    } else if (data.role === 'PROFESSOR') {
      await this.prisma.professor.create({
        data: {
          userId: user.id,
          employeeCode: `EMP${Date.now()}`,
          firstName: 'New',
          lastName: 'Professor',
        },
      });
    }

    return this.findById(user.id);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async getStats() {
    const [totalUsers, totalStudents, totalProfessors, totalSections, totalCourses, totalEnrollments] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.student.count(),
        this.prisma.professor.count(),
        this.prisma.section.count(),
        this.prisma.course.count(),
        this.prisma.enrollment.count(),
      ]);

    return {
      totalUsers,
      totalStudents,
      totalProfessors,
      totalSections,
      totalCourses,
      totalEnrollments,
    };
  }
}