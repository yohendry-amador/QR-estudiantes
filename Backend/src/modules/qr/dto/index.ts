import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';

export class GenerateQRDto {
  @ApiProperty()
  @IsUUID()
  sectionId: string;

  @ApiPropertyOptional({ description: 'Duración en segundos (default: 60)' })
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(600)
  durationSeconds?: number;
}

export class QRScanDto {
  @ApiProperty({ description: 'Datos del código QR codificados en base64' })
  @IsString()
  qrData: string;
}

export class QRResponseDto {
  @ApiProperty()
  sessionId: string;
  @ApiProperty()
  qrData: string;
  @ApiProperty()
  expiresAt: Date;
  @ApiProperty()
  sectionId: string;
}

export class ScanResponseDto {
  @ApiProperty()
  success: boolean;
  @ApiPropertyOptional()
  attendanceId?: string;
  @ApiProperty()
  message: string;
}