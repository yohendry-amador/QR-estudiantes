import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsController } from './controller';
import { ReportsService } from './service';

@Module({ imports: [PrismaModule], controllers: [ReportsController], providers: [ReportsService], exports: [ReportsService] })
export class ReportsModule {}