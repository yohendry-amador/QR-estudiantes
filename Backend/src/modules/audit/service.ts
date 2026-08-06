import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface AuditLogInput {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    const auditLog = await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValues: input.oldValues as Prisma.InputJsonValue | undefined,
        newValues: input.newValues as Prisma.InputJsonValue | undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });

    this.logger.debug(`Audit log created: ${input.action} on ${input.entityType}:${input.entityId}`);
    return auditLog;
  }

  async findAll(params: { skip?: number; take?: number; where?: Prisma.AuditLogWhereInput; orderBy?: Prisma.AuditLogOrderByWithRelationInput }) {
    const { skip = 0, take = 50, where = {}, orderBy = { timestamp: 'desc' } } = params;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({ skip, take, where, orderBy, include: { user: { select: { id: true, email: true, role: true } } } }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({ where: { entityType, entityId }, orderBy: { timestamp: 'desc' } });
  }

  async findByUser(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({ where: { userId }, orderBy: { timestamp: 'desc' }, take: limit });
  }
}