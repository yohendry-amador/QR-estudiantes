import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PaginationDto, AuditLogResponseDto } from './dto';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener todos los logs de auditoría' })
  @ApiResponse({ status: 200, description: 'Lista de logs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuditLogs(@Query() paginationDto: PaginationDto) {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 50;
    const skip = (page - 1) * limit;
    const { logs, total } = await this.auditService.findAll({ skip, take: limit });
    return { logs: logs.map(this.mapToResponse), total, page, limit };
  }

  @Get('entity/:entityType/:entityId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener logs de una entidad' })
  async getEntityAuditLogs(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    const logs = await this.auditService.findByEntity(entityType, entityId);
    return logs.map(this.mapToResponse);
  }

  private mapToResponse(log: any): AuditLogResponseDto {
    return {
      id: log.id,
      userId: log.userId,
      user: log.user ? { id: log.user.id, email: log.user.email, role: log.user.role } : null,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      oldValues: log.oldValues,
      newValues: log.newValues,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.timestamp,
    };
  }
}