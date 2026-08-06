import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface QRSessionData {
  sessionId: string;
  sectionId: string;
  professorId: string;
  generatedAt: string;
  expiresAt: string;
  signature: string;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379');

    this.client = new Redis(redisUrl, { retryStrategy: (times) => Math.min(times * 50, 2000) });

    this.client.on('connect', () => this.logger.log('Connected to Redis'));
    this.client.on('error', (error) => this.logger.error('Redis error:', error));
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  getClient(): Redis { return this.client; }

  async setQRSession(sessionId: string, data: QRSessionData, ttlSeconds: number): Promise<void> {
    await this.client.setex(`qr:session:${sessionId}`, ttlSeconds, JSON.stringify(data));
  }

  async getQRSession(sessionId: string): Promise<QRSessionData | null> {
    const data = await this.client.get(`qr:session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteQRSession(sessionId: string): Promise<void> {
    await this.client.del(`qr:session:${sessionId}`);
  }

  async setWithTTL(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.setex(key, ttlSeconds, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  async increment(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }
}