import { Controller, Get, Post, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SectionsService } from './service';
import { ProfessorsService } from '../professors/service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { CreateSectionDto, SectionResponseDto, CreateSessionDto, SessionResponseDto } from './dto';

@ApiTags('sections')
@Controller('sections')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
    private readonly professorsService: ProfessorsService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear sección' })
  @ApiResponse({ status: 201, type: SectionResponseDto })
  async create(@Body() dto: CreateSectionDto): Promise<SectionResponseDto> {
    const section = await this.sectionsService.create(dto);
    return section as any;
  }

  @Get()
  @ApiOperation({ summary: 'Listar secciones' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const p = page || 1;
    const l = limit || 50;
    return this.sectionsService.findAll({ skip: (p - 1) * l, take: l });
  }

  @Get('my-sections')
  @ApiOperation({ summary: 'Obtener mis secciones (profesor)' })
  async getMySections(@CurrentUser() user: CurrentUserPayload) {
    const professor = await this.professorsService.findByUserId(user.userId);
    if (!professor) {
      return [];
    }
    return this.sectionsService.getSectionsByProfessor(professor.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sección por ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.sectionsService.findById(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Obtener estudiantes de la sección' })
  async getStudents(@Param('id', ParseUUIDPipe) id: string) {
    return this.sectionsService.getStudents(id);
  }

  @Get(':id/session/active')
  @ApiOperation({ summary: 'Obtener sesión activa' })
  async getActiveSession(@Param('id', ParseUUIDPipe) id: string): Promise<SessionResponseDto | null> {
    return this.sectionsService.getActiveSession(id);
  }

  @Post(':id/sessions')
  @Roles(Role.PROFESSOR, Role.ADMIN)
  @ApiOperation({ summary: 'Crear sesión de asistencia' })
  async createSession(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateSessionDto): Promise<SessionResponseDto> {
    const session = await this.sectionsService.createSession(id, { startTime: new Date(dto.startTime), endTime: new Date(dto.endTime) });
    return session as any;
  }
}