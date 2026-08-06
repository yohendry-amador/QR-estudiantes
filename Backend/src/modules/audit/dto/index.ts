import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class AuditLogResponseDto {
  @ApiProperty()
  id: string;
  @ApiPropertyOptional()
  userId: string | null;
  @ApiPropertyOptional({ type: 'object' })
  user: { id: string; email: string; role: Role } | null;
  @ApiProperty()
  action: string;
  @ApiProperty()
  entityType: string;
  @ApiPropertyOptional()
  entityId: string | null;
  @ApiPropertyOptional({ type: 'object' })
  oldValues: Record<string, unknown> | null;
  @ApiPropertyOptional({ type: 'object' })
  newValues: Record<string, unknown> | null;
  @ApiPropertyOptional()
  ipAddress: string | null;
  @ApiPropertyOptional()
  userAgent: string | null;
  @ApiProperty()
  timestamp: Date;
}