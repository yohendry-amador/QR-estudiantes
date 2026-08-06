import { Controller, Get, Post, Patch, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, EnrollmentStatus } from '@prisma/client';
import { CreateEnrollmentDto, EnrollmentResponseDto } from './dto';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear inscripción (admin)' })
  @ApiResponse({ status: 201, type: EnrollmentResponseDto })
  async create(@Body() dto: CreateEnrollmentDto): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.create(dto);
    return enrollment as any;
  }

  @Post('me')
  @ApiOperation({ summary: 'Auto-inscripción del estudiante autenticado' })
  @ApiResponse({ status: 201, type: EnrollmentResponseDto })
  async enrollMe(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: { sectionId: string },
  ): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.enrollStudent(user.userId, dto.sectionId);
    return enrollment as any;
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Obtener inscripciones de estudiante' })
  async getStudentEnrollments(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.enrollmentsService.findByStudent(studentId);
  }

  @Get('section/:sectionId')
  @ApiOperation({ summary: 'Obtener estudiantes de sección' })
  async getSectionEnrollments(@Param('sectionId', ParseUUIDPipe) sectionId: string) {
    return this.enrollmentsService.findBySection(sectionId);
  }

  @Get('section/:sectionId/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener todas las inscripciones de una sección (admin)' })
  async getSectionEnrollmentsAll(@Param('sectionId', ParseUUIDPipe) sectionId: string) {
    return this.enrollmentsService.findBySection(sectionId);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener todas las inscripciones' })
  async getAllEnrollments() {
    return this.enrollmentsService.findAll();
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar inscripción (estado o sección)' })
  async updateEnrollment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { status?: EnrollmentStatus; sectionId?: string }
  ) {
    return this.enrollmentsService.update(id, data);
  }

  @Patch(':id/move')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Mover inscripción a otra sección' })
  async moveEnrollment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newSectionId') newSectionId: string
  ) {
    return this.enrollmentsService.move(id, newSectionId);
  }

  @Get('student/:studentId/history')
  @ApiOperation({ summary: 'Historial de inscripciones de un estudiante' })
  async getStudentEnrollmentHistory(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.enrollmentsService.findHistoryByStudent(studentId);
  }
}