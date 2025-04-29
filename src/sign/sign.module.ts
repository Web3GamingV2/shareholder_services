/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-22 14:58:57
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 17:04:01
 * @FilePath: /sbng_cake/shareholder_services/src/sign/sign.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { SignController } from './sign.controller';

@Module({
  controllers: [SignController],
  exports: [SignModule],
  providers: [SignController],
})
export class SignModule {}
