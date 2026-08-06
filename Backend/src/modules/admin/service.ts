import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalStudents, totalProfessors, totalCourses, totalSections, totalEnrollments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.student.count(),
      this.prisma.professor.count(),
      this.prisma.course.count(),
      this.prisma.section.count(),
      this.prisma.enrollment.count(),
    ]);

    return { totalUsers, totalStudents, totalProfessors, totalCourses, totalSections, totalEnrollments };
  }

  async updateUser(id: string, data: { email?: string; role?: Role; isActive?: boolean }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // If role changes, adjust related profiles
    if (data.role && data.role !== user.role) {
      // Remove old profile
      if (user.role === Role.STUDENT) {
        await this.prisma.student.deleteMany({ where: { userId: id } });
      } else if (user.role === Role.PROFESSOR) {
        await this.prisma.professor.deleteMany({ where: { userId: id } });
      }
      // Create new profile placeholder (optional)
      if (data.role === Role.STUDENT) {
        await this.prisma.student.create({ data: { userId: id, studentCode: `STU-${id.slice(0,8)}`, firstName: '', lastName: '' } });
      } else if (data.role === Role.PROFESSOR) {
        await this.prisma.professor.create({ data: { userId: id, employeeCode: `EMP-${id.slice(0,8)}`, firstName: '', lastName: '' } });
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Cascade deletes handled by Prisma relations (onDelete: Cascade)
    return this.prisma.user.delete({ where: { id } });
  }
}