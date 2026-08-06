import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AttendanceService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { CreateAttendanceDto, UpdateAttendanceDto, AttendanceResponseDto } from './dto';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.PROFESSOR, Role.ADMIN)
  @ApiOperation({ summary: 'Registrar asistencia manual' })
  @ApiResponse({ status: 201, type: AttendanceResponseDto })
  async recordAttendance(@Body() dto: CreateAttendanceDto): Promise<AttendanceResponseDto> {
    const attendance = await this.attendanceService.recordAttendance(dto);
    return attendance as any;
  }

  @Get('section/:sectionId')
  @ApiOperation({ summary: 'Obtener asistencia por sección' })
  @ApiQuery({ name: 'sessionId', required: false })
  async getSectionAttendance(@Param('sectionId', ParseUUIDPipe) sectionId: string, @Query('sessionId') sessionId?: string) {
    return this.attendanceService.findBySection(sectionId, { sessionId });
  }

  @Get('section/:sectionId/stats')
  @ApiOperation({ summary: 'Obtener estadísticas de asistencia' })
  async getSectionStats(@Param('sectionId', ParseUUIDPipe) sectionId: string, @Query('sessionId') sessionId?: string) {
    return this.attendanceService.getAttendanceStats(sectionId, sessionId);
  }

  @Get('student/me')
  @ApiOperation({ summary: 'Obtener mi historial de asistencia' })
  async getMyAttendance(@CurrentUser() user: CurrentUserPayload) {
    return { message: 'Use /reports/attendance endpoint', userId: user.userId };
  }

  @Patch(':id')
  @Roles(Role.PROFESSOR, Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar estado de asistencia' })
  @ApiResponse({ status: 200, type: AttendanceResponseDto })
  async updateAttendance(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAttendanceDto): Promise<AttendanceResponseDto> {
    const updated = await this.attendanceService.updateStatus(id, dto.status, dto.notes);
    return updated as any;
  }
}