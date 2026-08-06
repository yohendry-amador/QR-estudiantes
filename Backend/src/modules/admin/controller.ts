import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener estadísticas del sistema' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Patch('users/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar usuario (admin)' })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: { email?: string; role?: Role; isActive?: boolean },
  ) {
    return this.adminService.updateUser(id, data);
  }

  @Delete('users/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar usuario (admin)' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteUser(id);
  }
}