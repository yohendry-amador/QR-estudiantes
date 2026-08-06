import { Injectable, Logger } from '@nestjs/common';

export interface Notification { id: string; userId: string; title: string; message: string; type: string; read: boolean; createdAt: Date }

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private notifications: Notification[] = [];

  async create(data: { userId: string; title: string; message: string; type?: string }): Promise<Notification> {
    const notification: Notification = {
      id: Math.random().toString(36).substring(2, 15),
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'INFO',
      read: false,
      createdAt: new Date(),
    };
    this.notifications.push(notification);
    this.logger.log(`Notification created for user ${data.userId}: ${data.title}`);
    return notification;
  }

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notifications.filter(n => n.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) notification.read = true;
  }

  async markAllAsRead(userId: string): Promise<void> {
    this.notifications.filter(n => n.userId === userId).forEach(n => { n.read = true; });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }
}