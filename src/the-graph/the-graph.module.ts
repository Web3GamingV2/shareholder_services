/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 22:38:05
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-21 22:38:27
 * @FilePath: /sbng_cake/shareholder_services/src/the-graph/the-graph.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { TheGraphService } from './the-graph.service';

@Module({
  providers: [TheGraphService],
})
export class TheGraphModule {}
