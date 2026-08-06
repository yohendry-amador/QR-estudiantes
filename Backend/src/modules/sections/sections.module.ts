import { Module } from '@nestjs/common';
import { SectionsService } from './service';
import { SectionsController } from './controller';

@Module({
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}