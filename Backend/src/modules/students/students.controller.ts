import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StudentsService } from './students.service';

@ApiTags('Admin - Students')
@Controller('students')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all students with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.studentsService.findAll(page || 1, limit || 10, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  async findById(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new student' })
  async create(@Body() data: { email: string; password: string; studentCode: string; firstName: string; lastName: string }) {
    return this.studentsService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update student' })
  async update(
    @Param('id') id: string,
    @Body() data: { firstName?: string; lastName?: string; studentCode?: string },
  ) {
    return this.studentsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete student' })
  async delete(@Param('id') id: string) {
    return this.studentsService.delete(id);
  }

  @Get(':id/enrollments')
  @ApiOperation({ summary: 'Get student enrollments' })
  async getEnrollments(@Param('id') id: string) {
    return this.studentsService.getEnrollments(id);
  }

  @Get(':id/attendance-summary')
  @ApiOperation({ summary: 'Get student attendance summary' })
  async getAttendanceSummary(@Param('id') id: string) {
    return this.studentsService.getAttendanceSummary(id);
  }
}