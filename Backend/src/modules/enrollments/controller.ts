import { Controller, Get, Post, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateEnrollmentDto, EnrollmentResponseDto } from './dto';

@ApiTags('enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear inscripción' })
  @ApiResponse({ status: 201, type: EnrollmentResponseDto })
  async create(@Body() dto: CreateEnrollmentDto): Promise<EnrollmentResponseDto> {
    const enrollment = await this.enrollmentsService.create(dto);
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
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener todas las inscripciones de una sección (admin)' })
  async getSectionEnrollmentsAll(@Param('sectionId', ParseUUIDPipe) sectionId: string) {
    return this.enrollmentsService.findBySection(sectionId);
  }

  @Get('all')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener todas las inscripciones' })
  async getAllEnrollments() {
    return this.enrollmentsService.findAll();
  }
}