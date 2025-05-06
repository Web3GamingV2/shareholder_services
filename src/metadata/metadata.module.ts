/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-06 20:32:15
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-07 07:40:59
 * @FilePath: /shareholder_services/src/metadata/metadata.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { MetadataController } from './metadata.controller';

@Module({
  providers: [MetadataService],
  controllers: [MetadataController],
  exports: [MetadataService],
})
export class MetadataModule {}
