import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProfessorsService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { CreateProfessorDto, ProfessorResponseDto } from './dto';

@ApiTags('professors')
@Controller('professors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProfessorsController {
  constructor(private readonly professorsService: ProfessorsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear profesor' })
  async create(@Body() dto: CreateProfessorDto): Promise<ProfessorResponseDto> {
    const professor = await this.professorsService.create(dto);
    return professor as any;
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar profesores' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    const p = page || 1;
    const l = limit || 50;
    const { professors, total } = await this.professorsService.findAll({ skip: (p - 1) * l, take: l, search });
    return { professors: professors.map(p => ({ ...p, user: p.user })), total, page: p, limit: l };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener profesor por user ID' })
  async getByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<ProfessorResponseDto> {
    const professor = await this.professorsService.findByUserId(userId);
    if (!professor) throw new Error('Profesor no encontrado');
    return professor as any;
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Obtener perfil del profesor actual' })
  async getCurrentProfile(@CurrentUser() user: CurrentUserPayload): Promise<ProfessorResponseDto> {
    const professor = await this.professorsService.findByUserId(user.userId);
    if (!professor) throw new Error('Profesor no encontrado');
    return professor as any;
  }

  @Get(':id/sections')
  @ApiOperation({ summary: 'Obtener secciones del profesor' })
  async getSections(@Param('id', ParseUUIDPipe) id: string) {
    return this.professorsService.getSections(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar profesor' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: { firstName?: string; lastName?: string; employeeCode?: string }) {
    return this.professorsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar profesor' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.professorsService.delete(id);
  }
}