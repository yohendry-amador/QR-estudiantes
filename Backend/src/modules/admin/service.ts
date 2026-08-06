import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  async updateUser(id: string, data: { email?: string; role?: Role; isActive?: boolean; password?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // If role changes, adjust related profiles
    if (data.role && data.role !== user.role) {
      if (user.role === Role.STUDENT) {
        await this.prisma.student.deleteMany({ where: { userId: id } });
      } else if (user.role === Role.PROFESSOR) {
        await this.prisma.professor.deleteMany({ where: { userId: id } });
      }
      if (data.role === Role.STUDENT) {
        await this.prisma.student.create({ data: { userId: id, studentCode: `STU-${id.slice(0,8)}`, firstName: '', lastName: '' } });
      } else if (data.role === Role.PROFESSOR) {
        await this.prisma.professor.create({ data: { userId: id, employeeCode: `EMP-${id.slice(0,8)}`, firstName: '', lastName: '' } });
      }
    }

    const updateData: any = {
      email: data.email,
      role: data.role,
      isActive: data.isActive,
    };

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    return this.prisma.user.delete({ where: { id } });
  }
}