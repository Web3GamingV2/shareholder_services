/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-02 12:25:47
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-02 12:41:40
 * @FilePath: /shareholder_services/src/pat_subscriptions/pat_subscriptions.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { PatSubscriptionsService } from './pat_subscriptions.service';
import { PatSubscriptionsController } from './pat_subscriptions.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { ContractsCallerModule } from 'src/contracts_caller/contracts_caller.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [SupabaseModule, ContractsCallerModule, RedisModule],
  providers: [PatSubscriptionsService],
  controllers: [PatSubscriptionsController],
  exports: [PatSubscriptionsService],
})
export class PatSubscriptionsModule {}
