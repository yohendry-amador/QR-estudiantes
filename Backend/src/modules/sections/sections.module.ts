import { Module } from '@nestjs/common';
import { SectionsService } from './service';
import { SectionsController } from './controller';
import { ProfessorsModule } from '../professors/professors.module';

@Module({
  imports: [ProfessorsModule],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}