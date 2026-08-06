import { Module } from '@nestjs/common';
import { StudentsService } from './service';
import { StudentsController } from './controller';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}