import { Module } from '@nestjs/common';
import { SearchController } from './controller';
import { SearchService } from './service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}