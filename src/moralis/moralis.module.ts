/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 22:28:24
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-21 22:31:05
 * @FilePath: /sbng_cake/shareholder_services/src/moralis/moralis.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MoralisService } from './moralis.service';

@Global() // Make MoralisService available globally without importing MoralisModule everywhere
@Module({
  imports: [ConfigModule], // Ensure ConfigService is available
  providers: [MoralisService],
  exports: [MoralisService], // Export the service so it can be injected
})
export class MoralisModule {}
