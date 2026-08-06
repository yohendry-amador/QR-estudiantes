import { Module, Global } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { WebsocketGateway } from './websocket.gateway';
import { WebsocketService } from './websocket.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [WebsocketGateway, WebsocketService, JwtService],
  exports: [WebsocketGateway, WebsocketService, JwtService],
})
export class WebsocketModule {}