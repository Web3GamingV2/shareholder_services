/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-20 14:14:42
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-01 23:42:55
 * @FilePath: /sbng_cake/shareholder_services/src/redis/redis.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// import * as lodash from 'lodash-es';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis, SetCommandOptions } from '@upstash/redis';
import { tryJsonStringify } from 'src/common/utils';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private isInitialized = false;

  public getClient() {
    return this.redisClient;
  }

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
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

      this.isInitialized = true;
    } catch (err) {
      console.log(err);
      this.isInitialized = false;
    }
  }

  /**
   * 设置键值对，可附带过期时间等选项。
   * @param key 键
   * @param value 值
   * @param options 可选参数，例如 { ex: 3600 } 设置一小时过期
   */
  async set(
    key: string,
    value: string | number | object,
    options?: SetCommandOptions,
  ): Promise<string> {
    this.ensureInitialized();
    const valueToStore =
      typeof value === 'object' ? tryJsonStringify(value) : String(value);
    return this.redisClient.set(key, valueToStore, options);
  }

  /**
   * 获取指定键的值。
   * @param key 键
   * @returns 返回键对应的值，如果键不存在则返回 null。
   */
  async get<T = string>(key: string): Promise<T | null> {
    this.ensureInitialized();
    return this.redisClient.get<T>(key);
  }

  /**
   * 删除一个或多个键。
   * @param keys 一个或多个键名
   * @returns 返回成功删除的键的数量。
   */
  async del(...keys: string[]): Promise<number> {
    this.ensureInitialized();
    if (keys.length === 0) {
      return 0;
    }
    return this.redisClient.del(...keys);
  }

  /**
   * 原子地获取并删除指定键。常用于处理一次性令牌或 nonce。
   * @param key 键
   * @returns 返回键对应的值，如果键不存在则返回 null。
   */
  async getdel<T = string>(key: string): Promise<T | null> {
    this.ensureInitialized();
    return this.redisClient.getdel<T>(key);
  }

  private ensureInitialized() {
    if (!this.ensureInitialized) {
      if (!this.isInitialized) {
        throw new Error(
          'RedisService is not initialized. Check API Key configuration and logs.',
        );
      }
    }
  }

  onModuleDestroy() {
    console.log('RedisService onModuleDestroy');
  }
}
