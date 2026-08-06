import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get() @ApiOperation({ summary: 'Obtener mis notificaciones' })
  async getMyNotifications(@CurrentUser() user: CurrentUserPayload) {
    return this.notificationsService.findByUser(user.userId);
  }

  @Get('unread-count') @ApiOperation({ summary: 'Obtener count de notificaciones no leídas' })
  async getUnreadCount(@CurrentUser() user: CurrentUserPayload) {
    return { count: await this.notificationsService.getUnreadCount(user.userId) };
  }

  @Post(':id/read') @ApiOperation({ summary: 'Marcar notificación como leída' })
  async markAsRead(@Param('id') id: string) {
    await this.notificationsService.markAsRead(id);
    return { success: true };
  }

  @Post('read-all') @ApiOperation({ summary: 'Marcar todas como leídas' })
  async markAllAsRead(@CurrentUser() user: CurrentUserPayload) {
    await this.notificationsService.markAllAsRead(user.userId);
    return { success: true };
  }
}