import { Module } from '@nestjs/common';
import { ProfessorsService } from './service';
import { ProfessorsController } from './controller';

@Module({
  controllers: [ProfessorsController],
  providers: [ProfessorsService],
  exports: [ProfessorsService],
})
export class ProfessorsModule {}