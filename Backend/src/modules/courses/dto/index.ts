import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(10) credits?: number;
}

export class CourseResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() code: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() description: string | null;
  @ApiProperty() credits: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}