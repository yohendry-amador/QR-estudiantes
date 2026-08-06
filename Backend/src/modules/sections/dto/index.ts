import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsInt, IsDateString, IsOptional } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsUUID() courseId: string;
  @ApiProperty() @IsUUID() professorId: string;
  @ApiProperty() @IsString() schedule: string;
  @ApiProperty() @IsString() room: string;
  @ApiProperty() @IsString() semester: string;
  @ApiProperty() @IsInt() year: number;
}

export class CreateSessionDto {
  @ApiProperty() @IsDateString() startTime: string;
  @ApiProperty() @IsDateString() endTime: string;
}

export class SectionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() courseId: string;
  @ApiProperty() professorId: string;
  @ApiProperty() schedule: string;
  @ApiProperty() room: string;
  @ApiProperty() semester: string;
  @ApiProperty() year: number;
}

export class SessionResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() sectionId: string;
  @ApiProperty() startTime: Date;
  @ApiProperty() endTime: Date;
  @ApiProperty() status: string;
  @ApiPropertyOptional() qrCode: string | null;
  @ApiProperty() createdAt: Date;
}