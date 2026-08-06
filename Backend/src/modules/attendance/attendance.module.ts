import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { AttendanceController } from './controller';
import { AttendanceService } from './service';

@Module({
  imports: [PrismaModule, forwardRef(() => AuditModule), forwardRef(() => WebsocketModule)],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}