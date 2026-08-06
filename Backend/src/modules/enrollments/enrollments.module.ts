import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EnrollmentsController } from './controller';
import { EnrollmentsService } from './service';

@Module({
  imports: [PrismaModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}