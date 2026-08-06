import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly prismaService: PrismaService) {}

  async onModuleInit(): Promise<void> {
    await this.prismaService.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.prismaService.$disconnect();
  }
}