/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-19 11:14:08
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-30 11:57:56
 * @FilePath: /sbng_cake/shareholder_services/src/supabase/supabase.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { CacheModule } from 'src/cache/cache.module';
import { MemoryCacheModule } from 'src/memory_cache/memory-cache.module';

@Module({
  imports: [CacheModule, MemoryCacheModule],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
