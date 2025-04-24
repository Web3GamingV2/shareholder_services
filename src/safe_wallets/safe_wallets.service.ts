/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-23 14:05:37
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-24 21:49:14
 * @FilePath: /sbng_cake/shareholder_services/src/safe_walltes/safe_walltes.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Injectable,
  Logger,
  OnModuleInit,
  PlainLiteralObject,
} from '@nestjs/common';
import SafeApiKit from '@safe-global/api-kit';
import Safe from '@safe-global/protocol-kit';
import { createSafeClient, SafeClient } from '@safe-global/sdk-starter-kit';
import {
  MetaTransactionData,
  OperationType,
} from '@safe-global/safe-core-sdk-types'; // 导入交易数据类型
import { Interface } from 'ethers';
import {
  RPC_URL,
  SAFE_ADDRESS,
  SIGNER_PRIVATE_KEY,
  sepoliaNetworkConfig,
  PAT_PROXY_ADDRESS,
} from 'src/common/constants/safeWallet';
import { Hex } from 'src/common/interfaces';

@Injectable()
export class SafeWalletssService implements OnModuleInit {
  private readonly logger = new Logger(SafeWalletssService.name); // 添加 Logger 实例
  private safeClient: SafeClient;
  private protocolKit: Safe;
  private safeApiKit: SafeApiKit;
  private isInitialized = false;
  private isProtocolInitialized = false;
  private isApiInitialized = false;

  async onModuleInit() {
    this.createSafeClient();
    this.createSafeProtocolClient();
    this.createSafeApiKit();
  }

  private async createSafeApiKit(): Promise<void> {
    try {
      if (this.isApiInitialized) {
        console.log('SafeApiKit', this.safeApiKit);
        return;
      }
      this.safeApiKit = new SafeApiKit({
        chainId: BigInt(sepoliaNetworkConfig.chainId),
      });
      this.isApiInitialized = true;
      this.logger.log('Safe Api Kit initialized successfully.');
    } catch (error) {
      this.isApiInitialized = false;
      this.logger.error('Failed to initialize Safe Api Kit:', error);
    }
  }

  private async createSafeProtocolClient(): Promise<void> {
    if (this.isProtocolInitialized) {
      console.log('SafeProtocolClient', this.protocolKit);
      return;
    }
    try {
      const protocolKit = await Safe.init({
        safeAddress: SAFE_ADDRESS,
        provider: RPC_URL,
        signer: SIGNER_PRIVATE_KEY,
      });
      this.protocolKit = protocolKit;
      const isSafeDeployed = await protocolKit.isSafeDeployed(); // True
      this.logger.log(
        'Safe Protocol Client initialized successfully.',
        isSafeDeployed,
      );
      this.isProtocolInitialized = true;
      // await this.createTransaction();
    } catch (error) {
      this.logger.error('Failed to initialize Safe Protocol Client:', error);
      this.isProtocolInitialized = false;
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

  // 新增方法：获取待处理交易的签名信息
  async getTransactionConfirmations() {
    this.ensureInitialized(); // 确保 safeClient 初始化
    try {
      // 注意：你需要确认 safeClient 是否直接提供 getTransaction 方法
      // 或者是否需要一个更专门的 SafeServiceClient 实例。
      // 这里的 getTransaction 是一个示例方法名，实际方法可能不同。
      // 查阅 @safe-global/sdk-starter-kit 或 @safe-global/safe-service-client 文档获取确切方法。
      const transactionDetails = await this.safeClient.getPendingTransactions();

      // transactionDetails 对象通常会包含一个 confirmations 或 signatures 数组
      this.logger.log(`Transaction details for:`, transactionDetails);

      // 返回签名列表 (示例结构)
      return transactionDetails;
    } catch (error) {
      this.logger.error(`Failed to get confirmations for transaction:`, error);
      throw error; // 或者返回空数组/错误信息
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

  private ensureProtocolInitialized() {
    if (!this.isProtocolInitialized) {
      throw new Error(
        'Moralis SDK is not initialized. Check API Key configuration and logs.',
      );
    }
  }

  async createTransaction() {
    this.ensureProtocolInitialized();
    try {
      const patAbi = [
        'function setMultiSigWallet(address _multiSigWallet) external',
      ];
      const iface = new Interface(patAbi);
      // 2. 使用 viem 编码函数调用数据
      const encodedCallData = iface.encodeFunctionData('setMultiSigWallet', [
        SAFE_ADDRESS as Hex,
      ]);
      // 3. 构建 Safe 交易数据
      const safeTransactionData: MetaTransactionData = {
        to: PAT_PROXY_ADDRESS as Hex,
        value: '0', // 1 wei
        data: encodedCallData,
        operation: OperationType.Call,
      };

      const safeTransaction = await this.protocolKit.createTransaction({
        transactions: [safeTransactionData],
      });
      // 1. 获取交易哈希 (可选，但有助于追踪)
      const safeTxHash =
        await this.protocolKit.getTransactionHash(safeTransaction);
      this.logger.log(`Safe Transaction Hash for 1/1: ${safeTxHash}`);

      // 2. 签名交易 (protocolKit 使用初始化时提供的 signer 签名)
      // 注意：对于 1/1 Safe，签名后可以直接执行，signTransaction 本身可能不是必须显式调用的
      // 但执行 executeTransaction 时，SDK 内部会处理签名
      // const signature = await this.protocolKit.signTransaction(safeTransaction);
      // this.logger.log('Transaction signed by the single owner', signature);

      // 3. 直接执行交易
      // executeTransaction 会自动处理签名（如果需要）并将交易发送到区块链
      const executeTxResponse =
        await this.protocolKit.executeTransaction(safeTransaction);
      this.logger.log('Executing 1/1 transaction...');

      const transactionResponse =
        (await executeTxResponse.transactionResponse) as {
          wait: () => PlainLiteralObject;
        };
      this.logger.log(
        'Transaction executed successfully (1/1):',
        transactionResponse,
      );

      // 4. 等待交易确认 (可选)
      const receipt = await transactionResponse.wait();
      this.logger.log('Transaction executed successfully (1/1):', receipt);
      // 你可以从 receipt 中获取交易哈希等信息
      console.log('Transaction Hash:', receipt);
    } catch (error) {
      console.error('Error initializing Moralis SDK:', error);
    }
  }

  /**
   * 创建交易并提议到 Safe Transaction Service (多签第一步)
   * @param safeTransactionData 交易元数据
   * @returns Promise<string> 返回 Safe Transaction Hash
   */
  async proposeTransaction(
    safeTransactionData: MetaTransactionData,
    senderAddress: string,
  ): Promise<string> {
    this.ensureProtocolInitialized();
    this.ensureInitialized(); // 确保 safeClient 也初始化

    try {
      // 1. 创建 Safe 交易对象
      const safeTransaction = await this.protocolKit.createTransaction({
        transactions: [safeTransactionData],
        // options: { nonce: await this.protocolKit.getNonce() } // 可选：显式指定 nonce
      });

      // 2. 获取交易哈希
      const safeTxHash =
        await this.protocolKit.getTransactionHash(safeTransaction);
      this.logger.log(`Generated Safe Transaction Hash: ${safeTxHash}`);

      // 3. 使用当前 signer 对交易哈希进行签名
      const senderSignature = await this.protocolKit.signHash(safeTxHash);

      // 4. 使用 safeClient 将交易提议给 Safe Transaction Service
      // 注意：这里的 proposeTransaction 方法名和参数结构依赖于 safeClient 的实现
      // 查阅 @safe-global/sdk-starter-kit 或 @safe-global/safe-service-client 文档确认
      await this.safeApiKit.proposeTransaction({
        safeAddress: SAFE_ADDRESS,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: senderAddress,
        senderSignature: senderSignature.data,
      });

      this.logger.log(
        `Transaction proposed successfully with hash: ${safeTxHash}`,
      );
      return safeTxHash;
    } catch (error) {
      this.logger.error('Error proposing transaction:', error);
      throw error;
    }
  }
}
