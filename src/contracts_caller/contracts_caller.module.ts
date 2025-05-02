/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-02 12:37:21
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-02 12:38:50
 * @FilePath: /shareholder_services/src/contracts_caller/contracts_caller.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { ContractsCallerService } from './contracts_caller.service';
import { MoralisModule } from 'src/moralis/moralis.module';

@Module({
  imports: [MoralisModule],
  providers: [ContractsCallerService],
  controllers: [],
  exports: [ContractsCallerService], // <-- add this line to export the service from the module
})
export class ContractsCallerModule {}
