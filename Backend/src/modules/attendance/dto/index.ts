import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { AttendanceStatus, AttendanceMethod } from '@prisma/client';

export class CreateAttendanceDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsUUID() sessionId: string;
  @ApiProperty() @IsUUID() sectionId: string;
  @ApiProperty({ enum: AttendanceStatus }) @IsEnum(AttendanceStatus) status: AttendanceStatus;
  @ApiProperty({ enum: AttendanceMethod }) @IsEnum(AttendanceMethod) method: AttendanceMethod;
  @ApiProperty() @IsUUID() enrollmentId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateAttendanceDto {
  @ApiProperty({ enum: AttendanceStatus }) @IsEnum(AttendanceStatus) status: AttendanceStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class AttendanceResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() studentId: string;
  @ApiProperty() sessionId: string;
  @ApiProperty() sectionId: string;
  @ApiProperty() status: AttendanceStatus;
  @ApiProperty() recordedAt: Date;
  @ApiProperty() method: AttendanceMethod;
  @ApiProperty() enrollmentId: string;
  @ApiPropertyOptional() notes?: string;
}