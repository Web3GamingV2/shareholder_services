/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-22 14:58:31
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-01 23:56:29
 * @FilePath: /sbng_cake/shareholder_services/src/sign/sign.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { generateNonce, SiweMessage, SiweResponse } from 'siwe';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SignService {
  constructor(private readonly redisService: RedisService) {}

  async getNonce(address: string): Promise<{ nonce: string }> {
    try {
      const lowerCaseAddress = address.toLowerCase();
      const nonce = generateNonce();
      const nonceTTL = 300; // 5 minutes validity
      await this.setNonce(lowerCaseAddress, nonce, nonceTTL); // Use RedisService method
      console.log(
        `Nonce generated and stored in Redis for address: ${lowerCaseAddress}`,
      );
      return {
        nonce,
      };
    } catch (error) {
      console.error('Error generating nonce:', error);
      throw error;
    }
  }

  async verifySiweSignature(
    message: string,
    signature: string,
  ): Promise<{ verified: boolean; address: string }> {
    let siweMessage: SiweMessage;
    let userAddress = '';

    try {
      siweMessage = new SiweMessage(message);
      userAddress = siweMessage.address.toLowerCase();

      const storedNonce = await this.getAndDelNonce(userAddress);
      if (!storedNonce) {
        // 修改：抛出 BadRequestException
        throw new BadRequestException(
          '验证失败：Nonce 不存在或已过期。请重新获取 Nonce。',
        );
      }

      if (storedNonce !== siweMessage.nonce) {
        throw new BadRequestException('验证失败：Nonce 不匹配。');
      }

      const siweResponse: SiweResponse = await siweMessage.verify({
        signature,
      });
      console.log(siweResponse);
      return { verified: siweResponse.success, address: userAddress };
    } catch (error) {
      if (userAddress) {
        // 尝试清理 nonce，忽略此处的错误
        await this.deleteNonce(userAddress).catch((cleanupError) => {
          console.error(
            `Failed to cleanup nonce for ${userAddress} after verification error:`,
            cleanupError,
          );
        });
      }

      // 如果错误已经是 HttpException 的实例，直接重新抛出
      if (error instanceof HttpException) {
        throw error;
      }

      // 处理特定的 SIWE 错误并抛出相应的 HttpException
      if (error instanceof Error) {
        if (error.message.includes('Invalid signature')) {
          throw new UnauthorizedException('验证失败：签名无效。');
        }
        if (error.message.includes('Malformed message')) {
          throw new BadRequestException('验证失败：SIWE 消息格式错误。');
        }
      }
      console.error('Internal error during SIWE verification:', error); // 记录原始错误
      throw new InternalServerErrorException('签名验证过程中发生内部错误。');
    }
  }
  // --- Nonce Specific Methods (Keep or Refactor using base methods) ---

  /**
   * 存储 Nonce 并设置过期时间。
   * @param address 用户地址 (建议小写)
   * @param nonce Nonce 值
   * @param ttlSeconds 过期时间 (秒)
   */
  private async setNonce(
    address: string,
    nonce: string,
    ttlSeconds: number = 300,
  ): Promise<string> {
    const key = `nonce:${address.toLowerCase()}`;
    return this.redisService.set(key, nonce, { ex: ttlSeconds });
  }

  /**
   * 获取并删除 Nonce。
   * @param address 用户地址 (建议小写)
   * @returns 返回 Nonce 值，如果不存在或已过期则返回 null。
   */
  private async getAndDelNonce(address: string): Promise<string | null> {
    const key = `nonce:${address.toLowerCase()}`;
    return this.redisService.getdel<string>(key);
  }

  /**
   * 删除指定地址的 Nonce (例如在验证失败后)。
   * @param address 用户地址 (建议小写)
   */
  private async deleteNonce(address: string): Promise<number> {
    const key = `nonce:${address.toLowerCase()}`;
    return this.redisService.del(key);
  }
}
