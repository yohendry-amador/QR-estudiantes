import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { RedisModule } from '../redis/redis.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { QrController } from './controller';
import { QrService } from './service';
import { AttendanceModule } from '../attendance/attendance.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { SectionsModule } from '../sections/sections.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    forwardRef(() => AuditModule),
    RedisModule,
    forwardRef(() => WebsocketModule),
    forwardRef(() => AttendanceModule),
    EnrollmentsModule,
    forwardRef(() => SectionsModule),
    forwardRef(() => StudentsModule),
  ],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}