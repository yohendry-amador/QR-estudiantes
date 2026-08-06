import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebsocketService } from './websocket.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  role?: string;
}

@WebSocketGateway({ cors: { origin: '*', credentials: true }, namespace: '/attendance' })
export class WebsocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  constructor(
    private readonly websocketService: WebsocketService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(): void {
    this.websocketService.setServer(this.server);
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) { client.disconnect(); return; }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.userId = payload.userId;
      client.role = payload.role;
      this.logger.log(`Client connected: ${client.id} (User: ${payload.email})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('section:join')
  handleJoinSection(@MessageBody() data: { sectionId: string }, @ConnectedSocket() client: AuthenticatedSocket): void {
    if (!client.userId) { client.emit('error', { message: 'Not authenticated' }); return; }
    this.websocketService.joinSection(client, data.sectionId);
    client.emit('section:joined', { sectionId: data.sectionId });
  }

  @SubscribeMessage('section:leave')
  handleLeaveSection(@MessageBody() data: { sectionId: string }, @ConnectedSocket() client: AuthenticatedSocket): void {
    if (!client.userId) { client.emit('error', { message: 'Not authenticated' }); return; }
    this.websocketService.leaveSection(client, data.sectionId);
  }

  @SubscribeMessage('professor:join')
  handleJoinProfessor(@MessageBody() data: { professorId: string }, @ConnectedSocket() client: AuthenticatedSocket): void {
    if (!client.userId) { client.emit('error', { message: 'Not authenticated' }); return; }
    this.websocketService.joinProfessor(client, data.professorId);
    client.emit('professor:joined', { professorId: data.professorId });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket): void {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }
}