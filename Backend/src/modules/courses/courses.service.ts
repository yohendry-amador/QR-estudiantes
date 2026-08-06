import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.course.count(),
    ]);
    return { courses, total, page, limit };
  }

  async findById(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async create(data: { code: string; name: string; description?: string; credits?: number }) {
    const existing = await this.prisma.course.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictException('Course code already exists');
    return this.prisma.course.create({ data });
  }

  async update(id: string, data: { code?: string; name?: string; description?: string; credits?: number }) {
    if (data.code) {
      const existing = await this.prisma.course.findUnique({ where: { code: data.code } });
      if (existing && existing.id !== id) throw new ConflictException('Course code already in use');
    }
    return this.prisma.course.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.course.delete({ where: { id } });
    return { success: true };
  }
}