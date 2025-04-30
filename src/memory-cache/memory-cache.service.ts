/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-30 11:56:04
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-30 12:05:15
 * @FilePath: /shareholder_services/src/memory-cache/memory-cache.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable, OnModuleDestroy } from '@nestjs/common'; // 引入 OnModuleDestroy

type CacheItem<T> = {
  value: T;
  expiresAt: number; // Store expiration time in milliseconds
  timeout?: NodeJS.Timeout;
};

@Injectable()
export class MemoryCacheService implements OnModuleDestroy {
  // 实现 OnModuleDestroy 接口
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    const existing = this.cache.get(key);
    if (existing?.timeout) {
      clearTimeout(existing.timeout);
    }

    // Convert ttlSeconds to milliseconds for calculations
    const ttlMilliseconds = ttlSeconds ? ttlSeconds * 1000 : undefined;

    // Calculate expiresAt in milliseconds
    const expiresAt = ttlMilliseconds ? Date.now() + ttlMilliseconds : Infinity;
    let timeout: NodeJS.Timeout | undefined;

    if (ttlMilliseconds) {
      // Use milliseconds for setTimeout delay
      timeout = setTimeout(() => {
        this.cache.delete(key);
        console.log(`Cache item expired and removed: ${key}`); // Optional: log expiration
      }, ttlMilliseconds);
      // Make sure timeout doesn't keep Node.js process alive if it's the only thing left
      timeout.unref();
    }

    this.cache.set(key, { value, expiresAt, timeout });
  }

  get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) {
      return undefined;
    }

    // Check expiration using milliseconds
    if (item.expiresAt < Date.now()) {
      // Item has expired, clean it up (including timeout just in case)
      if (item.timeout) {
        clearTimeout(item.timeout);
      }
      this.cache.delete(key);
      console.log(`Attempted to get expired cache item: ${key}`); // Optional: log access to expired item
      return undefined;
    }

    return item.value;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    // Check expiration using milliseconds
    return !!item && item.expiresAt > Date.now();
  }

  delete(key: string): void {
    const item = this.cache.get(key);
    if (item?.timeout) {
      clearTimeout(item.timeout);
    }
    this.cache.delete(key);
  }

  clear(): void {
    // Clear all timeouts first
    for (const item of this.cache.values()) {
      if (item.timeout) {
        clearTimeout(item.timeout);
      }
    }
    // Then clear the map
    this.cache.clear();
    console.log('Memory cache cleared.'); // Optional: log clearing
  }

  // Lifecycle hook to clear cache on module destruction
  onModuleDestroy() {
    console.log('Clearing memory cache on module destroy...');
    this.clear();
  }
}
