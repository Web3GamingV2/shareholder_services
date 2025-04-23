/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-23 14:05:28
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-24 06:42:05
 * @FilePath: /sbng_cake/shareholder_services/src/safe_walltes/safe_walltes.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { SafeWalletssService } from './safe_wallets.service';
import { SafeWalletsController } from './safe_wallets.controller';

@Module({
  providers: [SafeWalletssService],
  controllers: [SafeWalletsController],
})
export class SafeWalletsModule {}
