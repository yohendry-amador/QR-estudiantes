import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) { return this.prisma.user.findUnique({ where: { id } }); }

  async findByEmail(email: string) { return this.prisma.user.findUnique({ where: { email } }); }

  async findAll(params: { skip?: number; take?: number; role?: string }) {
    const { skip = 0, take = 50, role } = params;
    const where: any = {};
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ]);
    return { users, total };
  }

  async update(id: string, data: { email?: string; isActive?: boolean }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.prisma.user.delete({ where: { id } });
  }
}