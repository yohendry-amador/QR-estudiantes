import { Module } from '@nestjs/common';
import { CoursesService } from './service';
import { CoursesController } from './controller';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}