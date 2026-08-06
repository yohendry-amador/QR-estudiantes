import { Module } from '@nestjs/common';
import { UsersService } from './service';
import { UsersController } from './controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}