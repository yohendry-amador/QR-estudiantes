import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProfessorsService } from './professors.service';

@ApiTags('Admin - Professors')
@Controller('professors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class ProfessorsController {
  constructor(private professorsService: ProfessorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all professors with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.professorsService.findAll(page || 1, limit || 10, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get professor by ID' })
  async findById(@Param('id') id: string) {
    return this.professorsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new professor' })
  async create(@Body() data: { email: string; password: string; employeeCode: string; firstName: string; lastName: string; department?: string }) {
    return this.professorsService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update professor' })
  async update(
    @Param('id') id: string,
    @Body() data: { firstName?: string; lastName?: string; employeeCode?: string },
  ) {
    return this.professorsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete professor' })
  async delete(@Param('id') id: string) {
    return this.professorsService.delete(id);
  }

  @Get('me/profile')
  @Roles('PROFESSOR')
  @ApiOperation({ summary: 'Get current professor profile' })
  async getMyProfile(@Request() req: any) {
    return this.professorsService.findByUserId(req.user.id);
  }

  @Get('me/sections')
  @Roles('PROFESSOR')
  @ApiOperation({ summary: 'Get current professor sections' })
  async getMySections(@Request() req: any) {
    const professor = await this.professorsService.findByUserId(req.user.id);
    if (!professor) throw new NotFoundException('Professor profile not found');
    return this.professorsService.getMySections(professor.id);
  }
}