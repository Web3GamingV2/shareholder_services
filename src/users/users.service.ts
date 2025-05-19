/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 20:51:23
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-20 00:24:18
 * @FilePath: /sbng_cake/shareholder_services/src/users/users.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';
import { PGRST116 } from 'src/common/constants/code';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UserProfile } from './users.interface';
import { ethers } from 'ethers';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAuthUserById(userId: string): Promise<AuthUser> {
    if (!userId) {
      throw new BadRequestException('无效的用户 ID。');
    }

    const supabaseAdmin = this.supabaseService.supabaseAdmin;

    try {
      const { data, error } =
        await supabaseAdmin.auth.admin.getUserById(userId);

      if (error) {
        if (
          error.status === 404 ||
          error.message.toLowerCase().includes('not found')
        ) {
          throw new NotFoundException(`找不到 ID 为 ${userId} 的认证用户。`);
        }
        throw new InternalServerErrorException(
          `获取认证用户信息时出错: ${error.message}`,
        );
      }

      // Supabase might return data.user structure
      const authUser = data?.user;

      if (!authUser) {
        throw new NotFoundException(`找不到 ID 为 ${userId} 的认证用户数据。`);
      }

      return authUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        '获取认证用户信息时发生内部错误。',
      );
    }
  }

  async findUserProfileById(userId: string): Promise<UserProfile> {
    if (!userId) {
      throw new BadRequestException('无效的用户 ID。');
    }

    const supabase = this.supabaseService.supabaseAdmin;

    try {
      const { data, error } = await supabase
        .from('profiles') // Target the 'profiles' table
        .select('*') // Select all columns, or specify needed columns: 'user_id, email, wallet_address, username'
        .eq('id', userId) // Filter by the user ID
        .maybeSingle(); // Expect 0 or 1 result, returns null if not found

      if (error && error.code !== PGRST116) {
        throw new InternalServerErrorException(
          `获取用户信息时出错: ${error.message}`,
        );
      }

      if (!data) {
        throw new NotFoundException(`找不到用户 ID 为 ${userId} 的用户信息。`);
      }

      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('获取用户信息时发生内部错误。');
    }
  }

  // 绑定社交账号
  async bindSocialAccount(
    address: string,
    socialType: string,
    socialId: string,
    signature: string,
  ) {
    // 验证签名
    const message = `Bind ${socialType} account: ${socialId} to wallet: ${address}`;
    const isValid = this.verifySignature(address, message, signature);

    if (!isValid) {
      throw new BadRequestException('Invalid signature');
    }

    const supabaseAdmin = this.supabaseService.supabaseAdmin;

    // 检查是否已有其他钱包绑定此社交账号
    const { data: existingBinding, error: checkError } = await supabaseAdmin
      .from('social_bindings')
      .select('*')
      .eq('socialType', socialType)
      .eq('socialId', socialId);

    if (checkError) {
      throw new InternalServerErrorException(
        `Failed to check social account binding: ${checkError.message}`,
      );
    }

    if (existingBinding && existingBinding.length > 0) {
      throw new BadRequestException(
        'This social account is already bound to another wallet',
      );
    }

    // 保存绑定关系
    const { data, error } = await supabaseAdmin.from('social_bindings').insert({
      address: address.toLowerCase(),
      socialType,
      socialId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (error) {
      throw new BadRequestException('Failed to bind social account');
    }

    return { success: true, data };
  }

  // 验证签名
  private verifySignature(
    address: string,
    message: string,
    signature: string,
  ): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  // 检查用户是否有资格参与空投（防女巫攻击）
  async checkEligibility(address: string) {
    const supabaseAdmin = this.supabaseService.supabaseAdmin;
    // 1. 检查社交账号绑定
    const { data: socialBindings, error: socialError } = await supabaseAdmin
      .from('social_bindings')
      .select('*')
      .eq('address', address.toLowerCase());

    if (socialError) {
      return;
    }

    const hasSocialBinding = socialBindings && socialBindings.length > 0;

    // 2. 检查IP和设备记录（防止同一设备多次领取）
    const { data: deviceRecords, error: deviceError } = await supabaseAdmin
      .from('user_devices')
      .select('*')
      .eq('address', address.toLowerCase());

    // 3. 检查链上行为（可以根据需要扩展）
    // 这里可以调用外部API或区块链查询服务来检查用户的链上行为

    if (deviceError) {
      return;
    }

    return {
      eligible: hasSocialBinding, // 简化版：只要绑定了社交账号就有资格
      reasons: {
        hasSocialBinding,
        hasDeviceRecord: deviceRecords && deviceRecords.length > 0,
        // 其他资格条件
      },
    };
  }

  // 记录用户设备信息（用于防女巫攻击）
  async recordDeviceInfo(address: string, deviceInfo: any, ipAddress: string) {
    const supabaseAdmin = this.supabaseService.supabaseAdmin;
    // 保存设备信息
    const { data, error } = await supabaseAdmin.from('user_devices').insert({
      address: address.toLowerCase(),
      deviceInfo,
      ipAddress,
      createdAt: new Date(),
    });

    if (error) {
      throw new BadRequestException('Failed to record device info');
    }

    return { success: true, data };
  }
}
