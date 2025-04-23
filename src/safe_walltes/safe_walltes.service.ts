/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-23 14:05:37
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-23 22:18:17
 * @FilePath: /sbng_cake/shareholder_services/src/safe_walltes/safe_walltes.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Safe from '@safe-global/protocol-kit';
import { createSafeClient, SafeClient } from '@safe-global/sdk-starter-kit';
import {
  MetaTransactionData,
  OperationType,
} from '@safe-global/safe-core-sdk-types'; // 导入交易数据类型
import { encodeFunctionData, parseAbi, Hex } from 'viem'; // 导入 viem 工具用于编码
import {
  RPC_URL,
  SAFE_ADDRESS,
  SIGNER_PRIVATE_KEY,
  PAT_PROXY_ADDRESS,
} from 'src/common/constants/safeWallet';

@Injectable()
export class SafeWalltesService implements OnModuleInit {
  private readonly logger = new Logger(SafeWalltesService.name); // 添加 Logger 实例
  private safeClient: SafeClient;
  private protocolKit: Safe;
  private isInitialized = false;

  async onModuleInit() {
    this.createSafeClient();
    this.createSafeProtocolClient();
  }

  private async createSafeProtocolClient(): Promise<void> {
    try {
      const patAbi = parseAbi([
        'function setMultiSigWallet(address _multiSigWallet) external',
      ]);
      const newWalletAddress = SAFE_ADDRESS; // 替换成实际地址
      const protocolKit = await Safe.init({
        safeAddress: SAFE_ADDRESS,
        provider: RPC_URL,
        signer: SIGNER_PRIVATE_KEY,
      });
      // 2. 使用 viem 编码函数调用数据
      const encodedCallData = encodeFunctionData({
        abi: patAbi,
        functionName: 'setMultiSigWallet',
        args: [newWalletAddress as Hex],
      });
      console.log('protocolKit', protocolKit);
      this.protocolKit = protocolKit;
      const isSafeDeployed = await protocolKit.isSafeDeployed(); // True
      const safeAddress = await protocolKit.getAddress();
      const safeOwners = await protocolKit.getOwners();
      const safeThreshold = await protocolKit.getThreshold();
      console.log(
        'isSafeDeployed',
        isSafeDeployed,
        safeAddress,
        safeOwners,
        safeThreshold,
      );
      const safeTransactionData: MetaTransactionData = {
        to: PAT_PROXY_ADDRESS as Hex,
        value: '0', // 1 wei
        data: encodedCallData,
        operation: OperationType.Call,
      };

      const safeTransaction = await protocolKit.createTransaction({
        transactions: [safeTransactionData],
      });
      // 1. 获取交易哈希 (可选，但有助于追踪)
      const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
      this.logger.log(`Safe Transaction Hash for 1/1: ${safeTxHash}`);

      // 2. 签名交易 (protocolKit 使用初始化时提供的 signer 签名)
      // 注意：对于 1/1 Safe，签名后可以直接执行，signTransaction 本身可能不是必须显式调用的
      // 但执行 executeTransaction 时，SDK 内部会处理签名
      // const signature = await protocolKit.signTransaction(safeTransaction);
      // this.logger.log('Transaction signed by the single owner');

      // 3. 直接执行交易
      // executeTransaction 会自动处理签名（如果需要）并将交易发送到区块链
      const executeTxResponse =
        await protocolKit.executeTransaction(safeTransaction);
      this.logger.log('Executing 1/1 transaction...');

      // 4. 等待交易确认 (可选)
      const receipt = await (
        executeTxResponse.transactionResponse as any
      ).wait();
      this.logger.log('Transaction executed successfully (1/1):', receipt);
      // 你可以从 receipt 中获取交易哈希等信息
      console.log('Transaction Hash:', receipt.transactionHash);
      this.logger.log('Safe Protocol Client initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Safe Protocol Client:', error);
    }
  }

  private async createSafeClient(): Promise<string> {
    try {
      if (this.isInitialized) {
        console.log('SafeWalltesService', this.safeClient);
        return;
      }
      this.safeClient = await createSafeClient({
        safeAddress: SAFE_ADDRESS,
        provider: RPC_URL,
        signer: SIGNER_PRIVATE_KEY,
      });
      this.isInitialized = true;
      this.logger.log(
        `Safe Client initialized successfully. Signer: ${await this.safeClient.getAddress()}`,
      );
    } catch (error) {
      console.error('Error initializing Moralis SDK:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Checks if the Moralis SDK is initialized.
   * Throws an error if not initialized.
   */
  private ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error(
        'Moralis SDK is not initialized. Check API Key configuration and logs.',
      );
    }
  }
}
