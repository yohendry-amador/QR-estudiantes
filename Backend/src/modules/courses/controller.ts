import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateCourseDto, CourseResponseDto } from './dto';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post() @Roles(Role.ADMIN) @ApiOperation({ summary: 'Crear curso' })
  async create(@Body() dto: CreateCourseDto): Promise<CourseResponseDto> { return this.coursesService.create(dto) as any; }

  @Get() @ApiOperation({ summary: 'Listar cursos' })
  @ApiQuery({ name: 'page', required: false, type: Number }) @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const p = page || 1, l = limit || 50;
    return this.coursesService.findAll({ skip: (p - 1) * l, take: l });
  }

  @Get(':id') @ApiOperation({ summary: 'Obtener curso por ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<CourseResponseDto> {
    const course = await this.coursesService.findById(id);
    if (!course) throw new Error('Curso no encontrado');
    return course as any;
  }

  @Patch(':id') @Roles(Role.ADMIN) @ApiOperation({ summary: 'Actualizar curso' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: { code?: string; name?: string; description?: string; credits?: number }) {
    return this.coursesService.update(id, body);
  }

  @Delete(':id') @Roles(Role.ADMIN) @ApiOperation({ summary: 'Eliminar curso' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.delete(id);
  }
}