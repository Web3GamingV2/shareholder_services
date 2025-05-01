/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-23 14:05:46
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-01 19:21:51
 * @FilePath: /sbng_cake/shareholder_services/src/safe_wallets/safe_wallets.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Body,
  Controller,
  Get,
  Param,
  PlainLiteralObject,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Interface } from 'ethers';
import { SafeWalletssService } from './safe_wallets.service';
import { BaseController, BaseResponse } from 'src/common/base';
import { Public } from 'src/common/decorators/public.decorator';
import { TransactionDto } from 'src/common/dtos/transaction.dto';
import { SafeMultisigTransactionListResponse } from '@safe-global/api-kit';

@Controller('safe-wallets')
export class SafeWalletsController extends BaseController {
  constructor(private readonly safeWalletssService: SafeWalletssService) {
    super();
  }

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
      const patAbi = [transactionDto.functionAbi];
      const iface = new Interface(patAbi);
      const functionArgs = transactionDto.functionArgs;
      // 2. 使用 viem 编码函数调用数据
      const encodedCallData = iface.encodeFunctionData(
        transactionDto.functionName,
        functionArgs,
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

  @Get('get-transaction-confirmations')
  @Public()
  async getTransactionConfirmations(): Promise<
    BaseResponse<SafeMultisigTransactionListResponse>
  > {
    try {
      const transactionConfirmations =
        await this.safeWalletssService.getTransactionConfirmations();
      return this.success(transactionConfirmations);
    } catch (error) {
      console.error(
        `Failed to get transaction confirmations: ${error.message}`,
        error.stack,
      );
      return this.error(
        `Failed to get transaction confirmations: ${error.message}`,
      );
    }
  }

  @Get('unsigned-signers/:safeTxHash') // 定义 GET 端点路由，包含 safeTxHash 参数
  @Public() // 根据需要决定是否公开
  async getUnsignedSigners(
    @Param('safeTxHash') safeTxHash: string, // 使用 @Param 获取路径参数
  ): Promise<BaseResponse<string[]>> {
    try {
      const unsignedSigners =
        await this.safeWalletssService.getUnsignedSigners(safeTxHash);
      return this.success(unsignedSigners);
    } catch (error) {
      console.error(
        `Failed to get unsigned signers for tx ${safeTxHash}: ${error.message}`,
        error.stack,
      );
      return this.error(`Failed to get unsigned signers: ${error.message}`);
    }
  }

  @Post('confirm-transaction')
  @Public()
  async confirmTransaction(
    @Body('safeTxHash') safeTxHash: string,
    @Body('signer') signer: string,
  ): Promise<BaseResponse<PlainLiteralObject>> {
    try {
      await this.safeWalletssService.confirmTransaction(safeTxHash, signer);
      return this.success({
        message: 'Transaction confirmed successfully.',
      });
    } catch (error) {
      console.error(
        `Failed to confirm transaction ${safeTxHash}: ${error.message}`,
        error.stack,
      );
      return this.error(`Failed to confirm transaction: ${error.message}`);
    }
  }

  @Get('is-executed/:safeTxHash') // 新增：检查交易是否执行的端点
  @Public() // 根据需要决定是否公开
  async isTransactionExecuted(
    @Param('safeTxHash') safeTxHash: string,
  ): Promise<BaseResponse<boolean>> {
    try {
      const isExecuted =
        await this.safeWalletssService.isTransactionExecuted(safeTxHash);
      return this.success(isExecuted);
    } catch (error) {
      console.error(
        `Failed to check execution status for tx ${safeTxHash}: ${error.message}`,
        error.stack,
      );
      // 注意：Service 层在 404 时返回 false，这里只处理其他错误
      return this.error(`Failed to check execution status: ${error.message}`);
    }
  }
}
