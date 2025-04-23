/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-23 14:05:28
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-23 19:49:20
 * @FilePath: /sbng_cake/shareholder_services/src/safe_walltes/safe_walltes.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { SafeWalltesService } from './safe_walltes.service';
import { SafeWalltesController } from './safe_walltes.controller';

@Module({
  providers: [SafeWalltesService],
  controllers: [SafeWalltesController],
})
export class SafeWalltesModule {}
