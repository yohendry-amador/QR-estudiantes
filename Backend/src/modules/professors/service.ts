import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ProfessorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { email: string; password?: string; employeeCode: string; firstName: string; lastName: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('El email ya está registrado');

    const existingProfessor = await this.prisma.professor.findUnique({ where: { employeeCode: data.employeeCode } });
    if (existingProfessor) throw new ConflictException('El código de empleado ya existe');

    const passwordHash = await bcrypt.hash(data.password || 'professor123', 12);
    const user = await this.prisma.user.create({ data: { email: data.email, passwordHash, role: Role.PROFESSOR } });

    return this.prisma.professor.create({
      data: { employeeCode: data.employeeCode, firstName: data.firstName, lastName: data.lastName, userId: user.id },
    });
  }

  async findById(id: string) {
    return this.prisma.professor.findUnique({
      where: { id },
      include: { user: { select: { email: true, role: true, isActive: true } } },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.professor.findUnique({
      where: { userId },
      include: { user: { select: { email: true, role: true, isActive: true } } },
    });
  }

  async findAll(params: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params;
    const where = search ? { OR: [{ firstName: { contains: search, mode: 'insensitive' as const } }, { lastName: { contains: search, mode: 'insensitive' as const } }, { employeeCode: { contains: search, mode: 'insensitive' as const } }] } : {};

    const [professors, total] = await Promise.all([
      this.prisma.professor.findMany({ where, skip, take, orderBy: { lastName: 'asc' }, include: { user: { select: { email: true, role: true, isActive: true } } } }),
      this.prisma.professor.count({ where }),
    ]);

    return { professors, total };
  }

  async getSections(professorId: string) {
    return this.prisma.section.findMany({
      where: { professorId },
      include: { course: true, _count: { select: { enrollments: true } } },
      orderBy: { code: 'asc' },
    });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; employeeCode?: string }) {
    const professor = await this.prisma.professor.findUnique({ where: { id } });
    if (!professor) throw new NotFoundException('Profesor no encontrado');

    return this.prisma.professor.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const professor = await this.prisma.professor.findUnique({ where: { id } });
    if (!professor) throw new NotFoundException('Profesor no encontrado');
    await this.prisma.professor.delete({ where: { id } });
    await this.prisma.user.delete({ where: { id: professor.userId } });
    return { success: true };
  }
}