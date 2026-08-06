import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { CreateStudentDto, UpdateStudentDto, StudentResponseDto } from './dto';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear estudiante' })
  async create(@Body() dto: CreateStudentDto): Promise<StudentResponseDto> {
    const student = await this.studentsService.create(dto);
    return student as any;
  }

  @Get()
  @Roles(Role.ADMIN, Role.PROFESSOR)
  @ApiOperation({ summary: 'Listar estudiantes' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    const p = page || 1;
    const l = limit || 50;
    const { students, total } = await this.studentsService.findAll({ skip: (p - 1) * l, take: l, search });
    return { students: students.map(s => ({ ...s, user: s.user })), total, page: p, limit: l };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener estudiante por user ID' })
  async getByUserId(@Param('userId', ParseUUIDPipe) userId: string): Promise<StudentResponseDto> {
    const student = await this.studentsService.findByUserId(userId);
    if (!student) throw new NotFoundException('Estudiante no encontrado');
    return student as any;
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Obtener perfil del estudiante actual' })
  async getCurrentProfile(@CurrentUser() user: CurrentUserPayload): Promise<StudentResponseDto> {
    const student = await this.studentsService.findByUserId(user.userId);
    if (!student) throw new NotFoundException('Estudiante no encontrado');
    return student as any;
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar estudiante' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateStudentDto): Promise<StudentResponseDto> {
    const student = await this.studentsService.update(id, dto);
    return student as any;
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar estudiante' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.delete(id);
  }
}

