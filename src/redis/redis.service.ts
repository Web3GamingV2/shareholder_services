/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-20 14:14:42
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-20 14:19:44
 * @FilePath: /sbng_cake/shareholder_services/src/redis/redis.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  public getClient() {
    return this.redisClient;
  }

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    console.log('RedisService onModuleInit');
    const redisUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const redisToken = this.configService.get<string>(
      'UPSTASH_REDIS_REST_TOKEN',
    );

    if (!redisUrl || !redisToken) {
      throw new Error('Upstash Redis URL or Token not configured.');
    }

    this.redisClient = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    console.log('Upstash Redis client initialized.');
  }
  onModuleDestroy() {
    console.log('RedisService onModuleDestroy');
  }
}
