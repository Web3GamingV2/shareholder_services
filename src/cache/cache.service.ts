/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-29 20:04:21
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-30 11:48:53
 * @FilePath: /shareholder_services/src/cache/cache.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common'; // 移除了未使用的 CacheStore
import { Cache as CacheManager } from 'cache-manager'; // CacheManager 重命名为 Cache

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager,
  ) {}

  // 获取缓存值
  async getCache<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  // 设置缓存值
  async setCache<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl * 1000);
  }

  // 删除缓存
  async deleteCache(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  // 清空所有缓存
  async clearAllCache(): Promise<void> {
    await this.cacheManager.clear();
  }
}
