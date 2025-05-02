/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-30 11:55:56
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-30 11:56:18
 * @FilePath: /shareholder_services/src/memory-cache/memory-cache.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { MemoryCacheService } from './memory-cache.service';

@Module({
  providers: [MemoryCacheService],
  exports: [MemoryCacheService],
})
export class MemoryCacheModule {}
