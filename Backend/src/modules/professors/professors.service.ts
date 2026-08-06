import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProfessorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { employeeCode: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [professors, total] = await Promise.all([
      this.prisma.professor.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { email: true, isActive: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.professor.count({ where }),
    ]);

    return { professors, total, page, limit };
  }

  async findById(id: string) {
    const professor = await this.prisma.professor.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, isActive: true, role: true } },
        sections: { include: { course: true } },
      },
    });

    if (!professor) throw new NotFoundException('Professor not found');
    return professor;
  }

  async findByUserId(userId: string) {
    return this.prisma.professor.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, isActive: true, role: true } },
        sections: { include: { course: true } },
      },
    });
  }

  async getMySections(professorId: string) {
    return this.prisma.section.findMany({
      where: { professorId },
      include: { course: true, _count: { select: { enrollments: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { email: string; password: string; employeeCode: string; firstName: string; lastName: string; department?: string }) {
    const existingProf = await this.prisma.professor.findUnique({ where: { employeeCode: data.employeeCode } });
    if (existingProf) throw new ConflictException('Employee code already exists');

    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new ConflictException('Email already registered');

    const user = await this.prisma.user.create({
      data: { email: data.email, passwordHash: data.password, role: 'PROFESSOR' },
    });

    return this.prisma.professor.create({
      data: {
        employeeCode: data.employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        userId: user.id,
      },
      include: { user: { select: { email: true, isActive: true } } },
    });
  }

  async update(id: string, data: { firstName?: string; lastName?: string; employeeCode?: string }) {
    if (data.employeeCode) {
      const existing = await this.prisma.professor.findUnique({ where: { employeeCode: data.employeeCode } });
      if (existing && existing.id !== id) throw new ConflictException('Employee code already in use');
    }

    return this.prisma.professor.update({
      where: { id },
      data,
      include: { user: { select: { email: true, isActive: true } } },
    });
  }

  async delete(id: string) {
    const professor = await this.findById(id);
    await this.prisma.user.delete({ where: { id: professor.userId } });
    return { success: true };
  }
}