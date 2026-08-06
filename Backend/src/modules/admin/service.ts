import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}