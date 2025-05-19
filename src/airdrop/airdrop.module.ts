/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-19 22:43:40
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-19 23:05:37
 * @FilePath: /shareholder_services/src/airdrop/airdrop.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { AirdropService } from './airdrop.service';
import { AirdropController } from './airdrop.controller';
import { SupabaseModule } from 'src/supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  providers: [AirdropService],
  controllers: [AirdropController],
  exports: [AirdropService],
})
export class AirdropModule {}
