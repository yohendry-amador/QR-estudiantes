import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string) {
    const trimmed = query.trim();
    if (!trimmed) {
      return { students: [], sections: [], courses: [] };
    }

    const [students, sections, courses] = await Promise.all([
      this.prisma.student.findMany({
        where: {
          OR: [
            { firstName: { contains: trimmed, mode: 'insensitive' } },
            { lastName: { contains: trimmed, mode: 'insensitive' } },
            { studentCode: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
        select: { id: true, firstName: true, lastName: true, studentCode: true },
        take: 10,
      }),
      this.prisma.section.findMany({
        where: {
          OR: [
            { code: { contains: trimmed, mode: 'insensitive' } },
            { room: { contains: trimmed, mode: 'insensitive' } },
            { course: { name: { contains: trimmed, mode: 'insensitive' } } },
          ],
        },
        include: { course: true },
        take: 10,
      }),
      this.prisma.course.findMany({
        where: {
          OR: [
            { name: { contains: trimmed, mode: 'insensitive' } },
            { code: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
    ]);

    return { students, sections, courses };
  }
}