import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, EnrollmentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { email: string; password?: string; studentCode: string; firstName: string; lastName: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('El email ya está registrado');

    const existingStudent = await this.prisma.student.findUnique({ where: { studentCode: data.studentCode } });
    if (existingStudent) throw new ConflictException('El código de estudiante ya existe');

    const passwordHash = await bcrypt.hash(data.password || 'changeme123', 12);
    const user = await this.prisma.user.create({ data: { email: data.email, passwordHash, role: Role.STUDENT } });

    return this.prisma.student.create({
      data: { studentCode: data.studentCode, firstName: data.firstName, lastName: data.lastName, userId: user.id },
    });
  }

  async findById(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: { user: { select: { email: true, role: true, isActive: true } } },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.student.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, role: true, isActive: true } },
        enrollments: {
          where: { status: EnrollmentStatus.ACTIVE },
          include: { section: { include: { course: true, professor: true } } },
          orderBy: { section: { course: { name: 'asc' } } },
        },
      },
    });
  }

  async findAll(params: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params;
    const where = search ? { OR: [{ firstName: { contains: search, mode: 'insensitive' as const } }, { lastName: { contains: search, mode: 'insensitive' as const } }, { studentCode: { contains: search, mode: 'insensitive' as const } }] } : {};

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({ where, skip, take, orderBy: { lastName: 'asc' }, include: { user: { select: { email: true, role: true, isActive: true } } } }),
      this.prisma.student.count({ where }),
    ]);

    return { students, total };
  }

  async update(id: string, data: { firstName?: string; lastName?: string; studentCode?: string }) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('Estudiante no encontrado');
    return this.prisma.student.update({ where: { id }, data });
  }

  async delete(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('Estudiante no encontrado');
    await this.prisma.student.delete({ where: { id } });
    await this.prisma.user.delete({ where: { id: student.userId } });
    return { success: true };
  }
}