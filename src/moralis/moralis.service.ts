import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Moralis from 'moralis';
// Import necessary types from Moralis SDK if needed for specific functions
// Example: import { EvmChain } from '@moralisweb3/common-evm-utils';

@Injectable()
export class MoralisService implements OnModuleInit {
  private readonly logger = new Logger(MoralisService.name);
  private isInitialized = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const apiKey = this.configService.get<string>('MORALIS_API_KEY');
    if (!apiKey) {
      this.logger.error(
        'Moralis API Key not found in configuration. Moralis SDK will not be initialized.',
      );
      return;
    }

    try {
      // Start Moralis SDK
      await Moralis.start({
        apiKey: apiKey,
        // ... other configuration options
      });
      this.isInitialized = true;
      this.logger.log('Moralis SDK initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Moralis SDK:', error);
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

  /**
   * Example: Get native balance for an address.
   * @param address The wallet address.
   * @param chain The chain ID (e.g., '0x1' for Ethereum Mainnet, '0x89' for Polygon).
   */
  async getNativeBalance(address: string, chain: string) {
    this.ensureInitialized();
    try {
      const response = await Moralis.EvmApi.balance.getNativeBalance({
        address,
        chain,
      });
      return response.toJSON(); // Or response.result depending on version/needs
    } catch (error) {
      this.logger.error(
        `Error fetching native balance for ${address} on chain ${chain}:`,
        error,
      );
      throw error; // Re-throw or handle as needed
    }
  }

  /**
   * Example: Run a smart contract function (read-only).
   * @param contractAddress The address of the smart contract.
   * @param functionName The name of the function to call.
   * @param abi The ABI fragment for the function.
   * @param params The parameters for the function call.
   * @param chain The chain ID.
   */
  async runContractFunction(
    contractAddress: string,
    functionName: string,
    abi: any,
    params: any,
    chain: string,
  ) {
    this.ensureInitialized();
    try {
      const response = await Moralis.EvmApi.utils.runContractFunction({
        address: contractAddress,
        functionName,
        abi,
        params,
        chain,
      });
      return response.toJSON(); // Or response.result
    } catch (error) {
      this.logger.error(
        `Error running function ${functionName} on contract ${contractAddress} on chain ${chain}:`,
        error,
      );
      throw error;
    }
  }
}
