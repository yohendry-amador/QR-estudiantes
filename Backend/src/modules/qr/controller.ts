import { Controller, Post, Delete, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QrService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { GenerateQRDto, QRScanDto, QRResponseDto, ScanResponseDto } from './dto';

@ApiTags('qr')
@Controller('qr')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('generate')
  @Roles(Role.PROFESSOR, Role.ADMIN)
  @ApiOperation({ summary: 'Generar código QR para sesión de asistencia' })
  @ApiResponse({ status: 201, type: QRResponseDto })
  async generateQR(@Body() dto: GenerateQRDto, @CurrentUser() user: CurrentUserPayload): Promise<QRResponseDto> {
    const result = await this.qrService.generateQRCode(dto.sectionId, user.userId, dto.durationSeconds);
    return {
      sessionId: result.sessionId,
      qrData: result.qrData,
      expiresAt: result.expiresAt,
      sectionId: result.sectionId,
    };
  }

  @Post('scan')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Escanear código QR y registrar asistencia' })
  @ApiResponse({ status: 200, type: ScanResponseDto })
  async scanQR(@Body() dto: QRScanDto, @CurrentUser() user: CurrentUserPayload): Promise<ScanResponseDto> {
    return this.qrService.validateAndRecordAttendance(dto.qrData, user.userId);
  }

  @Delete('session/:sessionId')
  @Roles(Role.PROFESSOR, Role.ADMIN)
  @ApiOperation({ summary: 'Cancelar sesión QR activa' })
  @ApiResponse({ status: 200 })
  async cancelSession(@Param('sessionId', ParseUUIDPipe) sessionId: string, @CurrentUser() user: CurrentUserPayload): Promise<{ message: string }> {
    await this.qrService.cancelSession(sessionId, user.userId);
    return { message: 'Sesión QR cancelada correctamente' };
  }
}