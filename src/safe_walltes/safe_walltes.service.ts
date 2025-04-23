/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-23 14:05:37
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-23 20:28:18
 * @FilePath: /sbng_cake/shareholder_services/src/safe_walltes/safe_walltes.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createSafeClient, SafeClient } from '@safe-global/sdk-starter-kit';
import {
  RPC_URL,
  SIGNER_ADDRESS,
  SIGNER_PRIVATE_KEY,
} from 'src/common/constants/safeWallet';

@Injectable()
export class SafeWalltesService implements OnModuleInit {
  private safeClient: SafeClient;

  async onModuleInit() {
    console.log('SafeWalltesService');
    this.safeClient = await createSafeClient({
      provider: RPC_URL,
      signer: SIGNER_PRIVATE_KEY,
      safeAddress: SIGNER_ADDRESS,
    });
    console.log(this.safeClient);
  }
}
