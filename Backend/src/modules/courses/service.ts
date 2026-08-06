import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { code: string; name: string; description?: string; credits?: number }) {
    const existing = await this.prisma.course.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictException('El código del curso ya existe');
    return this.prisma.course.create({ data: { code: data.code, name: data.name, description: data.description, credits: data.credits || 3 } });
  }

  async findById(id: string) { return this.prisma.course.findUnique({ where: { id } }); }

  async findAll(params: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 50, search } = params;
    const where = search ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }, { code: { contains: search, mode: 'insensitive' as const } }] } : {};
    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
      this.prisma.course.count({ where }),
    ]);
    return { courses, total };
  }

  async update(id: string, data: { code?: string; name?: string; description?: string; credits?: number }) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    if (data.code && data.code !== course.code) {
      const existing = await this.prisma.course.findUnique({ where: { code: data.code } });
      if (existing) throw new ConflictException('El código del curso ya existe');
    }
    return this.prisma.course.update({ where: { id }, data });
  }

  async delete(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    return this.prisma.course.delete({ where: { id } });
  }
}