import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsUUID() sectionId: string;
}

export class EnrollmentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() studentId: string;
  @ApiProperty() sectionId: string;
  @ApiProperty() status: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}