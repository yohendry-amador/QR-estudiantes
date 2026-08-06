import { Module } from '@nestjs/common';
import { AdminController } from './controller';
import { AdminService } from './service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}