import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAttendanceReport(params: { sectionId?: string; studentId?: string; startDate?: Date; endDate?: Date }) {
    const where: any = {};
    if (params.sectionId) where.sectionId = params.sectionId;
    if (params.studentId) where.studentId = params.studentId;
    if (params.startDate || params.endDate) {
      where.recordedAt = {};
      if (params.startDate) where.recordedAt.gte = params.startDate;
      if (params.endDate) where.recordedAt.lte = params.endDate;
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: { student: true, section: { include: { course: true } }, session: true },
      orderBy: { recordedAt: 'desc' },
    });

    const stats = await this.calculateStats(where);
    return { attendances, stats };
  }

  async getStudentAttendanceSummary(studentId: string) {
    const attendances = await this.prisma.attendance.findMany({ where: { studentId }, include: { section: { include: { course: true } } } });
    const total = attendances.length;
    const present = attendances.filter(a => a.status === AttendanceStatus.PRESENT).length;
    const absent = attendances.filter(a => a.status === AttendanceStatus.ABSENT).length;
    const tardy = attendances.filter(a => a.status === AttendanceStatus.TARDY).length;
    const justified = attendances.filter(a => a.status === AttendanceStatus.JUSTIFIED).length;
    const attendanceRate = total > 0 ? (present / total) * 100 : 0;
    return { studentId, total, present, absent, tardy, justified, attendanceRate: Math.round(attendanceRate * 100) / 100 };
  }

  async getSectionAttendanceSummary(sectionId: string) {
    const enrollments = await this.prisma.enrollment.count({ where: { sectionId, status: 'ACTIVE' } });
    const attendances = await this.prisma.attendance.groupBy({ by: ['status'], where: { sectionId }, _count: true });
    const total = attendances.reduce((sum, a) => sum + a._count, 0);
    const stats: any = { totalEnrolled: enrollments, totalAttendanceRecords: total };
    attendances.forEach(a => { stats[a.status.toLowerCase() + 'Count'] = a._count; });
    return stats;
  }

  private async calculateStats(where: any) {
    const [total, present, absent, tardy, justified] = await Promise.all([
      this.prisma.attendance.count({ where }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.PRESENT } }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.ABSENT } }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.TARDY } }),
      this.prisma.attendance.count({ where: { ...where, status: AttendanceStatus.JUSTIFIED } }),
    ]);
    return { total, present, absent, tardy, justified };
  }
}