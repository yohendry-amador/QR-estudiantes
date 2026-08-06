import { Controller, Get, Patch, Delete, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get() @Roles(Role.ADMIN) @ApiOperation({ summary: 'Listar usuarios' })
  @ApiQuery({ name: 'page', required: false, type: Number }) @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const p = page || 1, l = limit || 50;
    return this.usersService.findAll({ skip: (p - 1) * l, take: l });
  }

  @Get(':id') @ApiOperation({ summary: 'Obtener usuario por ID' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  @Patch(':id') @Roles(Role.ADMIN) @ApiOperation({ summary: 'Actualizar usuario' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: { email?: string; isActive?: boolean }) {
    return this.usersService.update(id, body);
  }

  @Delete(':id') @Roles(Role.ADMIN) @ApiOperation({ summary: 'Eliminar usuario' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.delete(id);
  }
}