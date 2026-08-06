import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() password?: string;
  @ApiProperty() @IsString() studentCode: string;
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
}

export class UpdateStudentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() studentCode?: string;
}

export class StudentResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() studentCode: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() userId: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}