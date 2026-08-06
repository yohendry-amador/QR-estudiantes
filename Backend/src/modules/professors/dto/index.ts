import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateProfessorDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() password?: string;
  @ApiProperty() @IsString() employeeCode: string;
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
}

export class ProfessorResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() employeeCode: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() userId: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}