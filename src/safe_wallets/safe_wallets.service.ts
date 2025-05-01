/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-23 14:05:37
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-01 19:04:41
 * @FilePath: /sbng_cake/shareholder_services/src/safe_walltes/safe_walltes.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Injectable,
  Logger,
  OnModuleInit,
  PlainLiteralObject,
  // PlainLiteralObject,
} from '@nestjs/common';
import SafeApiKit, {
  SafeMultisigTransactionListResponse,
} from '@safe-global/api-kit';
import Safe, {
  buildSignatureBytes,
  EthSafeSignature,
} from '@safe-global/protocol-kit';
import { createSafeClient, SafeClient } from '@safe-global/sdk-starter-kit';
import {
  MetaTransactionData,
  OperationType,
} from '@safe-global/safe-core-sdk-types'; // 导入交易数据类型
import {
  RPC_URL,
  SAFE_ADDRESS,
  SIGNER_PRIVATE_KEY,
  sepoliaNetworkConfig,
  PAT_PROXY_ADDRESS,
  // SIGNER_ADDRESS,
} from 'src/common/constants/safeWallet';
import { Hex } from 'src/common/interfaces';
// import { ethers } from 'ethers';

@Injectable()
export class SafeWalletssService implements OnModuleInit {
  private readonly logger = new Logger(SafeWalletssService.name); // 添加 Logger 实例
  private safeClient: SafeClient;
  private protocolKit: Safe;
  private safeApiKit: SafeApiKit;
  private isInitialized = false;
  private isApiInitialized = false;

  async onModuleInit() {
    this.createApkSafeClient();
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

  private async createSafeProtocolClient(): Promise<Safe> {
    try {
      const protocolKit = await Safe.init({
        safeAddress: SAFE_ADDRESS,
        provider: RPC_URL,
        signer: SIGNER_PRIVATE_KEY,
      });
      const isSafeDeployed = await protocolKit.isSafeDeployed(); // True
      this.logger.log(
        'Safe Protocol Client initialized successfully.',
        isSafeDeployed,
      );
      return protocolKit;
    } catch (error) {
      this.logger.error('Failed to initialize Safe Protocol Client:', error);
    }
  }

  private async createApkSafeClient(): Promise<string> {
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
   * 检查指定的 Safe 交易是否已经执行完成
   * @param safeTxHash 要检查的交易的哈希
   * @returns Promise<boolean> 如果交易已执行则返回 true，否则返回 false
   */
  async isTransactionExecuted(safeTxHash: string): Promise<boolean> {
    this.ensureInitialized(); // 确保 safeApiKit 初始化

    try {
      this.logger.log(
        `Checking execution status for transaction: ${safeTxHash}`,
      );
      const transactionDetails =
        await this.safeApiKit.getTransaction(safeTxHash);

      this.logger.log(
        `Transaction ${safeTxHash} execution status: ${transactionDetails.isExecuted}`,
      );
      return transactionDetails.isExecuted;
    } catch (error) {
      this.logger.error(
        `Failed to check execution status for transaction ${safeTxHash}:`,
        error.response?.data || error.message,
        error.stack,
      );
      // 如果交易未找到 (404)，可以认为它未执行
      if (error.response?.status === 404) {
        this.logger.warn(
          `Transaction ${safeTxHash} not found. Assuming not executed.`,
        );
        return false;
      }
      // 对于其他错误，重新抛出，让调用者处理
      throw new Error(
        `Failed to check execution status for transaction ${safeTxHash}: ${error.message}`,
      );
    }
  }

  // 新增方法：获取待处理交易的签名信息
  async getTransactionConfirmations(): Promise<SafeMultisigTransactionListResponse> {
    this.ensureInitialized(); // 确保 safeClient 初始化
    try {
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

  // 创建一个多签交易 签名即可不要执行等待所有人签完后执行
  async createTransaction(encodedCallData: string): Promise<string> {
    try {
      // 3. 构建 Safe 交易数据
      const safeTransactionData: MetaTransactionData = {
        to: PAT_PROXY_ADDRESS as Hex,
        value: '0', // 1 wei
        data: encodedCallData,
        operation: OperationType.Call,
      };
      let currentProtocolKit = await this.createSafeProtocolClient();
      let safeTransaction = await currentProtocolKit.createTransaction({
        transactions: [safeTransactionData],
      });
      // 1. 获取交易哈希 (可选，但有助于追踪)
      const safeTxHash =
        await currentProtocolKit.getTransactionHash(safeTransaction);
      this.logger.log(`Safe Transaction Hash for 1/1: ${safeTxHash}`);

      const signature = await currentProtocolKit.signTransaction(
        safeTransaction,
        'eth_sign',
      );
      console.log(signature);

      currentProtocolKit = await currentProtocolKit.connect({
        provider: RPC_URL, // 替换为你的提供
        safeAddress: SAFE_ADDRESS,
        // signer: '0x7fc93b5620662f523AE2387aE38A444baaE68f88',
        signer:
          '14f62f6ce4fd14a56241addc06b1ff7ab3f5c4f2319a1e637a4171e9df8485d8',
      });

      safeTransaction =
        await currentProtocolKit.signTransaction(safeTransaction);

      console.log('Signing safeTransactionV2 transaction...', safeTransaction);

      currentProtocolKit = await currentProtocolKit.connect({
        provider: RPC_URL, // 替换为你的提供
        safeAddress: SAFE_ADDRESS,
        // signer: '0x7fc93b5620662f523AE2387aE38A444baaE68f88',
        signer:
          'df88309e6c332657e972973a28fd6226faaa3247bcbbf6efaf924014b2619e60',
      });
      safeTransaction =
        await currentProtocolKit.signTransaction(safeTransaction);

      console.log('Signing safeTransactionV3 transaction...', safeTransaction);
      const executeTxResponse =
        await currentProtocolKit.executeTransaction(safeTransaction);
      console.log('Executing 1/1 transaction...', executeTxResponse);

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
      return safeTxHash;
    } catch (error) {
      console.error('Error initializing Moralis SDK:', error);
      throw error;
    }
  }

  async executeTransaction(singer: string): Promise<void> {
    try {
      console.log('singer', singer);
    } catch (error) {
      console.error('Error initializing Moralis SDK:', error);
      throw error;
    }
  }

  /**
   * 创建交易并提议到 Safe Transaction Service (多签第一步)
   * @param safeTransactionData 交易元数据
   * @returns Promise<string> 返回 Safe Transaction Hash
   */
  async proposeTransaction(
    encodedCallData: string,
    senderAddress: string,
  ): Promise<string> {
    this.ensureInitialized(); // 确保 safeClient 也初始化

    try {
      const pkOwner = await this.createSafeProtocolClient();
      const safeTransactionData: MetaTransactionData = {
        to: PAT_PROXY_ADDRESS as Hex,
        value: '0', // 1 wei
        data: encodedCallData,
        operation: OperationType.Call,
      };
      // 1. 创建 Safe 交易对象
      const safeTransaction = await pkOwner.createTransaction({
        transactions: [safeTransactionData],
      });

      // 2. 获取交易哈希
      const safeTxHash = await pkOwner.getTransactionHash(safeTransaction);
      this.logger.log(`Generated Safe Transaction Hash: ${safeTxHash}`);
      const signTransaction = await pkOwner.signTransaction(safeTransaction);
      const signatureOwner = signTransaction.getSignature(
        senderAddress,
      ) as EthSafeSignature;
      if (!signatureOwner) {
        throw new Error(`Signature not found for ${senderAddress}`);
      }
      // 4. 使用 safeClient 将交易提议给 Safe Transaction Service
      // 注意：这里的 proposeTransaction 方法名和参数结构依赖于 safeClient 的实现
      // 查阅 @safe-global/sdk-starter-kit 或 @safe-global/safe-service-client 文档确认
      await this.safeApiKit.proposeTransaction({
        safeAddress: SAFE_ADDRESS,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress: senderAddress,
        senderSignature: buildSignatureBytes([signatureOwner]),
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

  /**
   * 根据待处理交易哈希获取尚未签名的所有者列表
   * @param safeTxHash 待处理交易的哈希
   * @returns Promise<string[]> 返回未签名所有者的地址列表
   */
  async getUnsignedSigners(safeTxHash: string): Promise<string[]> {
    this.ensureInitialized(); // 确保 safeApiKit 初始化
    try {
      const protocolKit = await this.createSafeProtocolClient();
      // 1. 获取指定交易的详细信息
      const transactionDetails =
        await this.safeApiKit.getTransaction(safeTxHash);

      // 2. 获取 Safe 的所有所有者
      const allOwners = await protocolKit.getOwners();
      const lowerCaseAllOwners = allOwners.map((owner) => owner.toLowerCase()); // 转换为小写以进行不区分大小写的比较

      // 3. 获取已签名的所有者
      const signedOwners =
        transactionDetails.confirmations?.map((conf) =>
          conf.owner.toLowerCase(),
        ) || []; // 同样转换为小写

      // 4. 找出未签名的所有者
      const unsignedSigners = lowerCaseAllOwners.filter(
        (owner) => !signedOwners.includes(owner),
      );

      this.logger.log(
        `Unsigned signers for transaction ${safeTxHash}: ${unsignedSigners.join(', ')}`,
      );
      return unsignedSigners;
    } catch (error) {
      this.logger.error(
        `Failed to get unsigned signers for transaction ${safeTxHash}:`,
        error,
      );
      // 根据需要可以抛出更具体的错误或返回空数组
      if (error.response?.status === 404) {
        throw new Error(`Transaction with hash ${safeTxHash} not found.`);
      }
      throw new Error(
        `An error occurred while fetching unsigned signers: ${error.message}`,
      );
    }
  }

  /**
   * 使用当前服务的签名者确认（签名）一个待处理的 Safe 交易
   * @param safeTxHash 要确认的交易的哈希
   * @returns Promise<void>
   *  14f62f6ce4fd14a56241addc06b1ff7ab3f5c4f2319a1e637a4171e9df8485d8
   */
  async confirmTransaction(safeTxHash: string, signer: string): Promise<void> {
    this.ensureInitialized(); // 确保 safeApiKit 初始化

    try {
      const protocolKit = await this.createSafeProtocolClient();
      // 1. (可选) 获取交易详情以验证状态或存在性
      const txDetails = await this.safeApiKit.getTransaction(safeTxHash);
      if (!txDetails || txDetails.isExecuted) {
        throw new Error(
          `Transaction ${safeTxHash} not found or already executed.`,
        );
      }
      this.logger.log(`Attempting to confirm transaction: ${safeTxHash}`);

      // 2. 检查签名数量是否达到阈值
      const threshold = await protocolKit.getThreshold();
      const confirmationsCount = txDetails.confirmations?.length || 0;

      if (confirmationsCount < threshold) {
        throw new Error(
          `Not enough confirmations to execute. Have ${confirmationsCount}, need ${threshold}.`,
        );
      }

      // 3. 重建交易对象
      const safeTransactionData: MetaTransactionData = {
        to: txDetails.to,
        value: txDetails.value,
        data: txDetails.data || '0x',
        operation: txDetails.operation,
        // 其他必要字段
      };

      const safeTransaction = await protocolKit.createTransaction({
        transactions: [safeTransactionData],
        options: {
          nonce: txDetails.nonce,
        },
      });

      console.log(txDetails.confirmations);

      const signTransaction =
        await protocolKit.signTransaction(safeTransaction);
      const signatureSigner = signTransaction.getSignature(
        signer,
      ) as EthSafeSignature;

      const signature = await protocolKit.signHash(safeTxHash);

      console.log(signature, signatureSigner);

      // 3. 使用 safeApiKit 将签名提交给 Safe Transaction Service
      await this.safeApiKit.confirmTransaction(safeTxHash, signature.data);
    } catch (error) {
      this.logger.error(
        `Failed to confirm transaction ${safeTxHash}:`,
        error.response?.data || error.message, // 尝试记录更详细的 API 错误信息
        error.stack,
      );
      // 可以根据错误类型抛出更具体的异常
      if (error.response?.data?.message?.includes('Already confirmed')) {
        this.logger.warn(`Signer already confirmed transaction ${safeTxHash}`);
        // 可以选择不抛出错误，或者抛出一个特定的已知错误
        // throw new Error(`Signer already confirmed transaction ${safeTxHash}`);
        return; // 如果已经确认，则认为操作成功（幂等性）
      }
      throw new Error(
        `Failed to confirm transaction ${safeTxHash}: ${error.message}`,
      );
    }
  }
}
