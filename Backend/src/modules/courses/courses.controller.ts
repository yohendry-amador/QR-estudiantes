import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CoursesService } from './courses.service';

@ApiTags('Admin - Courses')
@Controller('courses')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.coursesService.findAll(page || 1, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  async findById(@Param('id') id: string) {
    return this.coursesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new course' })
  async create(@Body() data: { code: string; name: string; description?: string; credits?: number }) {
    return this.coursesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course' })
  async update(@Param('id') id: string, @Body() data: { code?: string; name?: string; description?: string; credits?: number }) {
    return this.coursesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course' })
  async delete(@Param('id') id: string) {
    return this.coursesService.delete(id);
  }
}