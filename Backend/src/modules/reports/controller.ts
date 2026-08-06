import { Controller, Get, Query, UseGuards, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('attendance') @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Reporte de asistencia' })
  @ApiQuery({ name: 'sectionId', required: false }) @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'startDate', required: false }) @ApiQuery({ name: 'endDate', required: false })
  async getAttendanceReport(
    @Query('sectionId') sectionId?: string, @Query('studentId') studentId?: string,
    @Query('startDate') startDate?: string, @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getAttendanceReport({
      sectionId, studentId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('student/:studentId/summary') @ApiOperation({ summary: 'Resumen de asistencia de estudiante' })
  async getStudentSummary(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.reportsService.getStudentAttendanceSummary(studentId);
  }

  @Get('section/:sectionId/summary') @ApiOperation({ summary: 'Resumen de asistencia de sección' })
  async getSectionSummary(@Param('sectionId', ParseUUIDPipe) sectionId: string) {
    return this.reportsService.getSectionAttendanceSummary(sectionId);
  }
}