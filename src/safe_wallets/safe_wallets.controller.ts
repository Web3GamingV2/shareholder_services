/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-23 14:05:46
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-30 21:17:22
 * @FilePath: /sbng_cake/shareholder_services/src/safe_wallets/safe_wallets.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Body,
  Controller,
  PlainLiteralObject,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Interface } from 'ethers';
import { SafeWalletssService } from './safe_wallets.service';
import { BaseController, BaseResponse } from 'src/common/base';
import { Public } from 'src/common/decorators/public.decorator';
import { SAFE_ADDRESS } from 'src/common/constants/safeWallet';
import { Hex } from 'src/common/interfaces';
import { TransactionDto } from 'src/common/dtos/transaction.dto';

@Controller('safe-wallets')
export class SafeWalletsController extends BaseController {
  constructor(private readonly safeWalletssService: SafeWalletssService) {
    super();
  }

  // 新增：调用 createTransaction 的端点
  /**
   * {
	"data": {
		"message": "Transaction creation initiated successfully.",
		"safeTxHash": "0x118ba728e325671286b15219139f8aa7930c087d5066849746c252b2799079f0"
	},
	"message": "success",
	"errno": 0
}
   * @param transactionDto 
   * @returns 
   */
  @Post('create-transaction') // 定义 POST 端点路由
  @Public() // 如果此端点需要公开访问
  async createTransaction(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    transactionDto: TransactionDto, // 接收请求体
  ): Promise<BaseResponse<PlainLiteralObject>> {
    // 返回 BaseResponse 类型
    console.log('Received request to create transaction.', transactionDto);
    try {
      // 1. 定义 ABI
      const patAbi = [
        // 'function setMultiSigWallet(address _multiSigWallet) external',
        transactionDto.functionAbi,
      ];
      const iface = new Interface(patAbi);
      // 2. 使用 viem 编码函数调用数据
      const encodedCallData = iface.encodeFunctionData(
        transactionDto.functionName,
        [SAFE_ADDRESS as Hex],
      );
      const safeTxHash = await this.safeWalletssService.proposeTransaction(
        encodedCallData,
        transactionDto.senderAddress,
      );
      console.log('Transaction creation process initiated successfully.');
      // 返回成功的响应，可以包含一个简单的消息
      return this.success({
        message: 'Transaction creation initiated successfully.',
        safeTxHash,
      });
    } catch (error) {
      console.error(
        `Failed to create transaction: ${error.message}`,
        error.stack,
      );
      // 返回错误的响应
      return this.error(`Failed to create transaction: ${error.message}`);
    }
  }
}
