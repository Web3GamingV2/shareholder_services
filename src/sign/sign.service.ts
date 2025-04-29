/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-22 14:58:31
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-22 15:12:55
 * @FilePath: /sbng_cake/shareholder_services/src/sign/sign.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { generateNonce, SiweMessage } from 'siwe';
import { BaseController, BaseResponse } from 'src/common/base';
import { PGRST116 } from 'src/common/constants/code';
import { UpdateWalletDto } from 'src/common/dtos/update-wallet.dto';
import { RedisService } from 'src/redis/redis.service';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class SignService extends BaseController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  async getNonce(address: string): Promise<BaseResponse<{ nonce: string }>> {
    try {
      const lowerCaseAddress = address.toLowerCase();
      const nonce = generateNonce();
      const nonceTTL = 300; // 5 minutes validity
      await this.setNonce(lowerCaseAddress, nonce, nonceTTL); // Use RedisService method
      console.log(
        `Nonce generated and stored in Redis for address: ${lowerCaseAddress}`,
      );
      return this.success({ nonce });
    } catch (error) {
      console.error('Error generating nonce:', error);
      return this.error('Failed to generate nonce.');
    }
  }

  async verifySiweSignature(
    message: string,
    signature: string,
  ): Promise<
    BaseResponse<{ verified: boolean; address?: string; error?: string }>
  > {
    let siweMessage: SiweMessage;
    let userAddress = '';

    try {
      // 1. Parse the SIWE message
      siweMessage = new SiweMessage(message);
      userAddress = siweMessage.address.toLowerCase();

      // 2. Retrieve and consume the nonce from Redis
      const storedNonce = await this.getAndDelNonce(userAddress);
      if (!storedNonce) {
        return this.error(
          '验证失败：Nonce 不存在或已过期。请重新获取 Nonce。',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Verify the nonce from the message against the stored nonce
      if (storedNonce !== siweMessage.nonce) {
        // Nonce was consumed by getAndDelNonce, no need to delete again.
        return this.error('验证失败：Nonce 不匹配。', HttpStatus.BAD_REQUEST);
      }

      // 4. Verify the signature
      // The verify method throws an error on failure
      await siweMessage.verify({ signature });

      // Verification successful
      return this.success<{ verified: boolean; address: string }>(
        { verified: true, address: userAddress },
        '签名验证成功。',
      );
    } catch (error) {
      // Ensure nonce is deleted if verification failed after retrieval
      if (userAddress) {
        await this.deleteNonce(userAddress); // Attempt to clean up nonce if verify failed
      }

      // Handle specific SIWE errors
      if (error instanceof Error) {
        if (error.message.includes('Invalid signature')) {
          return this.error('验证失败：签名无效。', HttpStatus.UNAUTHORIZED);
        }
        if (error.message.includes('Malformed message')) {
          return this.error(
            '验证失败：SIWE 消息格式错误。',
            HttpStatus.BAD_REQUEST,
          );
        }
        // Handle other potential SiweError types if necessary
      }

      // Generic internal error
      return this.error(
        '签名验证过程中发生内部错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 5. Update Wallet Address in Profile via SIWE
   * Requires the user to be authenticated (pass user object or ID).
   */
  async updateWalletAddress(
    userId: string, // ID of the logged-in user
    dto: UpdateWalletDto, // Contains SIWE message and signature
  ): Promise<BaseResponse<{ status: string }>> {
    const { message, signature } = dto;
    const supabase = this.supabaseService.supabaseAdmin; // Use admin for profile update
    let userAddress = '';

    try {
      // 1. Verify SIWE Message
      const siweMessage = new SiweMessage(message);
      userAddress = siweMessage.address.toLowerCase();

      // 2. Verify Nonce (Crucial: Use a nonce obtained specifically for this update action)
      // Assuming the frontend called getNonce before initiating this update.
      const storedNonce = await this.getAndDelNonce(userAddress); // Use the wallet address for nonce key
      if (!storedNonce || storedNonce !== siweMessage.nonce) {
        return this.error(
          '无效或过期的请求凭证 (Nonce)。请重试。',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 3. Verify Signature
      await siweMessage.verify({ signature });

      const { data: existingLink, error: linkCheckError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('wallet_address', userAddress)
        .neq('user_id', userId) // Exclude the current user
        .maybeSingle(); // Use maybeSingle to handle 0 or 1 result

      if (linkCheckError && linkCheckError.code !== PGRST116) {
        return this.error(
          '检查钱包地址关联状态时出错。',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      if (existingLink) {
        return this.error('该钱包地址已被其他账户关联。', HttpStatus.CONFLICT);
      }

      // 5. Update the profile for the logged-in user
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ wallet_address: userAddress }) // Update the wallet address field
        .eq('user_id', userId); // Ensure we only update the correct user's profile

      if (updateError) {
        return this.error(
          '更新钱包地址时出错。',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return this.success({ status: 'updated' }, '钱包地址更新成功。');
    } catch (siweError) {
      // Handle SIWE verification errors specifically
      if (
        siweError instanceof Error &&
        (siweError.message.includes('Invalid signature') ||
          siweError.message.includes('Nonce mismatch'))
      ) {
        await this.deleteNonce(userAddress); // Clean up potentially consumed nonce
        return this.error('钱包签名验证失败。', HttpStatus.UNAUTHORIZED);
      }
      // Handle DB or other errors
      if (
        siweError instanceof ConflictException ||
        siweError instanceof InternalServerErrorException ||
        siweError instanceof BadRequestException
      ) {
        return this.error(siweError.message, siweError.getStatus());
      }
      return this.error(
        '更新钱包地址时发生内部错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
