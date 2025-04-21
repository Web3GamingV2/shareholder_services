/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-19 11:15:12
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-20 18:38:20
 * @FilePath: /sbng_cake/shareholder_services/src/auth/auth.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from 'src/supabase/supabase.service';
import { VerifyInviteDto } from '../common/dtos/verify-invite.dto';
import { LoginDto } from '../common/dtos/login.dto';
import { generateNonce, SiweMessage } from 'siwe';
import { RedisService } from 'src/redis/redis.service';
import { BaseController, BaseResponse } from 'src/common/base';
import { ActivateDto } from 'src/common/dtos/activate.dto';

@Injectable()
export class AuthService extends BaseController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  async verifyInvite(
    verifyInviteDto: VerifyInviteDto,
  ): Promise<{ nonce: string }> {
    console.log(verifyInviteDto);
    return {
      nonce: '1234',
    };
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

  async login(
    loginDto: LoginDto,
  ): Promise<
    BaseResponse<{ status: string; userId?: string; message?: string }>
  > {
    const { message, signature } = loginDto;
    const supabase = this.supabaseService.getSupabaseAdmin;
    let userAddress = '';
    try {
      const siweMessage = new SiweMessage(message);
      userAddress = siweMessage.address.toLowerCase();

      const storedNonce = await this.getAndDelNonce(userAddress);
      console.log(storedNonce);
      if (!storedNonce || storedNonce !== siweMessage.nonce) {
        return this.error(
          'Invalid or expired nonce. Please try again or contact support.',
        );
      }

      console.log(`Nonce verified for login attempt: ${userAddress}`);

      // 2. Verify SIWE Signature
      await siweMessage.verify({ signature });
      console.log(`SIWE signature verified for: ${userAddress}`);
      // 3. Check if user exists in Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, activated_at')
        .eq('wallet_address', userAddress)
        .single();

      if (!profile || !profile.user_id) {
        console.log(`User profile not found for address: ${userAddress}`);
        return this.error(
          'User not found. Please check your wallet address or invite code.',
        );
      }

      // 验证签名
      const fields = await siweMessage.verify({ signature });
      console.log(fields);
      // 验证签名
    } catch (error) {
      console.error('Error parsing SIWE message:', error);
      return this.error(error.message);
    }
  }

  // 激活用户
  async activateWithInvite(
    activateDto: ActivateDto,
  ): Promise<
    BaseResponse<{ status: string; userId?: string; message?: string }>
  > {
    const { inviteCode, message, signature } = activateDto;
    const supabase = this.supabaseService.getSupabaseAdmin;
    let userAddress = '';
    try {
      const siweMessage = new SiweMessage(message);
      userAddress = siweMessage.address.toLowerCase();
      console.log(userAddress);
      // 验证签名
      // 1. Verify Nonce (Use a nonce obtained specifically for activation)
      const storedNonce = await this.getAndDelNonce(userAddress);
      if (!storedNonce || storedNonce !== siweMessage.nonce) {
        return this.error(
          'Invalid or expired nonce. Please try again or contact support.',
        );
      }
      // 2. Verify SIWE Signature
      await siweMessage.verify({ signature });

      console.log(`SIWE signature verified for activation: ${userAddress}`);

      // 3. Check if invite code exists and is valid
      const { data: invite, error: inviteError } = await supabase
        .from('invites')
        .select('id, wallet_address')
        .eq('code', inviteCode);

      if (inviteError || !invite || invite.length === 0) {
        console.log(`Invalid or expired invite code: ${inviteCode}`);
        return this.error('Invalid or expired invite code.');
      }

      let userId = '';
      // 4. Check if user already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('wallet_address', userAddress)
        .single();
      if (profileError) {
        return this.error(
          'An error occurred while checking for existing user.',
        );
      }

      if (existingProfile && existingProfile.user_id) {
        userId = existingProfile.user_id;
        console.log(`User already exists: ${userAddress}`);
        const { data: roles, error: roleCheckError } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', userId)
          .limit(1);
        if (roleCheckError) {
          return this.error('An error occurred while checking user roles.');
        }
        // 检查用户是否已经有角色
        if (roles && roles.length > 0) {
          return this.success({
            status: 'success',
            userId: existingProfile.user_id,
            message: 'User already exists.',
          });
        }
      } else {
        console.log(`Creating new user for activation: ${userAddress}`);
        // Create Supabase Auth User
        const { data: newUser, error: createUserError } =
          await supabase.auth.admin.createUser({
            email: `${userAddress}@wallet.placeholder.com`, // Use placeholder email
            password: Math.random().toString(36).slice(-12), // Secure random password
            email_confirm: true, // Auto-confirm as wallet is verified via SIWE
          });
        if (createUserError) {
          console.error('Error creating Supabase Auth User:', createUserError);
          return this.error('Failed to create user.');
        }
        userId = newUser.user.id;
        console.log(`Created new Supabase user ${userId}`);

        // Create Profile
        const { data: profile, error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            wallet_address: userAddress,
            activated_at: new Date().toISOString(),
          });

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          await supabase.auth.admin.deleteUser(userId); // Cleanup user if profile creation fails
          return this.error('Failed to create profile.');
        }

        console.log(`Created profile for user ${userId}`, profile);

        const now = new Date();
        const { error: updateInviteError } = await supabase
          .from('invites')
          .update({ is_used: true, used_by_address: userAddress, used_at: now })
          .eq('code', inviteCode);
        if (updateInviteError) {
          console.error('Invite update error:', updateInviteError);
          // Handle potential rollback or error state
          return this.error('Failed to update invite status.');
        }

        console.log(`Marked invite ${inviteCode} as used by ${userAddress}`);

        const { error: assignRoleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role_id: 'member' }); // Assign default role
        if (assignRoleError) {
          console.error('Role assignment error:', assignRoleError);
          // Handle potential rollback or error state
          return this.error('Failed to assign user role.');
        }
        console.log(`Assigned 'member' role to user ${userId}`);

        console.log(`User ${userId} activated successfully.`);
        return this.success({
          status: 'activation_success',
          userId: userId,
          message: 'Account activated successfully.',
        });
      }
    } catch (error) {
      console.error('Error parsing SIWE message:', error);
      return this.error(error.message);
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
