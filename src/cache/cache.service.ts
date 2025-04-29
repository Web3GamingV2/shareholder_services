/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-29 20:04:21
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 22:26:34
 * @FilePath: /shareholder_services/src/cache/cache.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common'; // 移除了未使用的 CacheStore
import { Cache as CacheManager } from 'cache-manager'; // CacheManager 重命名为 Cache

@Injectable()
export class CacheService {
  constructor(
    // 确保类型是 Cache (从 cache-manager 导入)
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheManager,
  ) {}

  // 获取缓存值
  async getCache<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  // 设置缓存值
  async setCache<T>(key: string, value: T, ttl?: number): Promise<void> {
    // ttl 改为可选，使用泛型
    // 注意：ttl 在 v5 中是毫秒，v4 是秒。请根据你的 cache-manager 版本调整。
    // 假设是 v5+ (毫秒)
    await this.cacheManager.set(key, value, ttl);
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
