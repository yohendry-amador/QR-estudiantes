import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProbusService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('probus')
@Controller('probus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProbusController {
  constructor(private readonly probusService: ProbusService) {}

  @Post('sync/attendance') @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Sincronizar registro de asistencia con Probus' })
  async syncAttendance(@Body() record: any) {
    return { synced: await this.probusService.syncAttendanceRecord(record) };
  }

  @Post('sync/student') @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Sincronizar datos de estudiante con Probus' })
  async syncStudent(@Body() student: any) {
    return { synced: await this.probusService.syncStudentData(student) };
  }

  @Post('sync/professor') @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Sincronizar datos de profesor con Probus' })
  async syncProfessor(@Body() professor: any) {
    return { synced: await this.probusService.syncProfessorData(professor) };
  }
}