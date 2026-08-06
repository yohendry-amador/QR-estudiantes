import { Module } from '@nestjs/common';
import { ProbusController } from './controller';
import { ProbusService } from './service';

@Module({ controllers: [ProbusController], providers: [ProbusService], exports: [ProbusService] })
export class ProbusModule {}