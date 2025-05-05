/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-05 22:49:01
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-05 22:49:36
 * @FilePath: /shareholder_services/src/pinata/pinata.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { PinataService } from './pinata.service';

@Module({
  exports: [PinataService],
  providers: [PinataService],
})
export class PinataModule {}
