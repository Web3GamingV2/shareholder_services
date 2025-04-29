/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-19 11:15:12
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 18:15:18
 * @FilePath: /sbng_cake/shareholder_services/src/auth/auth.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from 'src/supabase/supabase.service';
import { BaseController, BaseResponse } from 'src/common/base';
import { EmailPasswordDto } from 'src/common/dtos/email-password.dto';
import { PGRST116 } from 'src/common/constants/code';
import { EnrollTotpDto } from 'src/common/dtos/enroll-totp.dto';
import { createClient, User } from '@supabase/supabase-js';
import { TotpVerifyDto } from 'src/common/dtos/totp-verify.dto';
import { UnenrollTotpDto } from 'src/common/dtos/unenroll-totp.dto';
import { TotpCodeDto } from 'src/common/dtos/totp-code.dto';
import { ADMIN_EMAILS_KEY } from 'src/common/constants/redis';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService extends BaseController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super();
  }

  async login(dto: EmailPasswordDto): Promise<
    BaseResponse<{
      accessToken: string;
      refreshToken?: string;
      needsMfa?: boolean;
      userId?: string;
    }>
  > {
    const supabase = this.supabaseService.supabaseAdmin; // Use standard client for login
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      });

      if (error) {
        if (
          error.message.toLowerCase().includes('mfa') ||
          error.message
            .toLowerCase()
            .includes('multi factor authentication required')
        ) {
          return this.success(
            { accessToken: null, needsMfa: true },
            '需要多因素认证 (MFA)。',
          );
        }

        return this.error(
          '登录失败。请检查您的凭据并确保您的账户已激活。',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (!data.session || !data.user) {
        return this.error('登录失败，无法获取会话。', HttpStatus.UNAUTHORIZED);
      }

      return this.success(
        {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          userId: data.user.id,
          needsMfa: false,
        },
        '登录成功。',
      );
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return this.error(error.message, HttpStatus.UNAUTHORIZED);
      }
      return this.error(
        '登录过程中发生内部错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 2. Register with Email and Password
   */
  async register(dto: EmailPasswordDto): Promise<User> {
    const supabase = this.supabaseService.supabaseAdmin; // Use admin client for user creation
    try {
      const { data: existingUser, error: lookupError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', dto.email)
        .maybeSingle();
      console.log('Existing User:', existingUser);
      console.log('Lookup Error:', lookupError);
      if (lookupError && lookupError.code !== PGRST116) {
        throw new InternalServerErrorException('检查用户时出错。');
      }
      if (existingUser) {
        throw new ConflictException('该邮箱已被注册。');
      }

      // 1. 从 Redis 获取管理员邮箱列表
      const adminEmails =
        (await this.redisService.get<string[]>(ADMIN_EMAILS_KEY)) || [];

      console.log('Admin Emails:', adminEmails);

      // 2. 确定用户角色
      const isAdmin = adminEmails.includes(dto.email.toLowerCase());

      // 这里通过 trigger 会自动生成一条记录
      const { data: newUser, error: createUserError } =
        await supabase.auth.admin.createUser({
          email: dto.email,
          password: dto.password,
          email_confirm: true,
        });

      if (createUserError) {
        if (createUserError.message.includes('already exists')) {
          throw new ConflictException('该邮箱已被注册。');
        }
        throw new InternalServerErrorException('创建用户时出错。');
      }

      const userId = newUser.user.id;

      const { error: createProfileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            email: dto.email,
            is_active: isAdmin, // Set based on admin email
          },
          {
            onConflict: 'id',
          },
        );

      if (createProfileError) {
        await supabase.auth.admin.deleteUser(userId);
        throw new InternalServerErrorException('创建用户 Profile 时出错。');
      }

      return newUser.user; // 直接返回数据，不使用 this.success
    } catch (error) {
      // 直接将捕获的异常抛出，让 controller 处理
      if (
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('注册过程中发生内部错误。');
    }
  }

  /**
   * 3. Enroll TOTP (Request Step) - Generates QR code/secret
   * Requires the user to be authenticated (pass user object or ID).
   */
  async enrollTotp(
    dto: EnrollTotpDto,
  ): Promise<
    BaseResponse<{ factorId: string; qrCode: string; secret: string }>
  > {
    const supabase = this.supabaseService.supabaseAdmin; // Use admin client for MFA enrollment
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(dto.accessToken);

      if (userError || !user) {
        return this.error(
          '无效的用户令牌或令牌已过期。',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // 2. Create a temporary Supabase client instance authenticated as the user
      // This ensures the enroll operation runs with the correct user context
      // without modifying the shared client instance.
      const userSupabaseClient = createClient(
        this.configService.get<string>('SUPABASE_URL'),
        this.configService.get<string>('SUPABASE_ANON_KEY'), // Use anon key for initialization
        {
          global: {
            headers: { Authorization: `Bearer ${dto.accessToken}` }, // Pass the user's token
          },
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          },
        },
      );

      const { data, error } = await userSupabaseClient.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'YourAppName', // Optional: Customize issuer name in authenticator app
        friendlyName: 'YourAppName TOTP', // Optional: Customize friendly name
      });

      if (error) {
        return this.error('无法开始 TOTP 注册流程。');
      }

      if (!data || !data.id || !data.totp?.qr_code || !data.totp?.secret) {
        return this.error(
          '无法开始 TOTP 注册流程。',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      // Return factorId, QR code (as SVG string or data URL), and secret
      return this.success(
        {
          factorId: data.id,
          qrCode: data.totp.qr_code, // This is typically an SVG string
          secret: data.totp.secret,
        },
        '请扫描二维码或手动输入密钥，并验证一次性密码以完成绑定。',
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        return this.error(error.message, error.getStatus());
      }
      return this.error(
        '请求 TOTP 注册时发生内部错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 3. Verify and Bind TOTP (Binding Step)
   * Requires the user to be authenticated.
   */
  async verifyAndBindTotp(
    dto: TotpVerifyDto, // Contains factorId and the code from authenticator app
  ): Promise<BaseResponse<{ status: string }>> {
    const supabase = this.supabaseService.supabaseAdmin;
    try {
      // First, challenge the factor
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: dto.factorId,
        });

      if (challengeError) {
        return this.error('无法创建 TOTP 验证挑战。');
      }

      if (!challengeData || !challengeData.id) {
        return this.error(
          '无法创建 TOTP 验证挑战。',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const challengeId = challengeData.id;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: dto.factorId,
        challengeId: challengeId,
        code: dto.code,
      });

      if (verifyError) {
        if (verifyError.message.toLowerCase().includes('invalid totp code')) {
          throw new BadRequestException('提供的一次性密码无效或已过期。');
        }
        throw new BadRequestException('无法验证一次性密码。');
      }

      return this.success({ status: 'verified' }, 'TOTP 已成功启用。');
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        return this.error(error.message, error.getStatus());
      }
      return this.error(
        '绑定 TOTP 时发生内部错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 3. Unenroll TOTP
   * Requires the user to be authenticated.
   */
  async unenrollTotp(
    dto: UnenrollTotpDto, // Contains factorId to unenroll
  ): Promise<BaseResponse<{ status: string }>> {
    const supabase = this.supabaseService.supabaseAdmin;
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: dto.factorId,
      });

      if (error) {
        if (error.message.toLowerCase().includes('not found')) {
          return this.error('找不到指定的认证因素。', HttpStatus.NOT_FOUND);
        }
        throw new BadRequestException('无法解绑 TOTP 认证因素。');
      }

      return this.success({ status: 'unenrolled' }, 'TOTP 已成功解绑。');
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        return this.error(error.message, error.getStatus());
      }
      return this.error(
        '解绑 TOTP 时发生内部错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyTotpCodeAndLogin(
    dto: TotpCodeDto, // Contains the TOTP code
  ): Promise<
    BaseResponse<{ accessToken: string; userId: string; refreshToken: string }>
  > {
    const supabase = this.supabaseService.supabaseAdmin;

    try {
      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError) {
        return this.error(
          '无法获取认证因素列表。',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const totpFactor = factorsData?.totp?.[0]; // Assuming only one TOTP factor
      if (!totpFactor || !totpFactor.id || totpFactor.status !== 'verified') {
        throw new BadRequestException('用户未启用有效的 TOTP 认证。');
      }
      const factorId = totpFactor.id;

      // 2. Create a challenge for the factor
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) {
        return this.error(
          '无法创建 MFA 验证挑战。',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const challengeId = challengeData.id;
      const { data: verifyData, error: verifyError } =
        await supabase.auth.mfa.verify({
          factorId,
          challengeId,
          code: dto.code,
        });

      if (verifyError) {
        return this.error(
          '提供的一次性密码无效或已过期。',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const refreshedUser = (await supabase.auth.getUser()).data.user; // Get potentially updated user state
      if (!refreshedUser) {
        return this.error(
          '无法在 MFA 验证后获取用户信息。',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return this.success(
        {
          accessToken: verifyData.access_token,
          userId: verifyData.user.id,
          refreshToken: verifyData.refresh_token,
        },
        'MFA 验证成功，登录完成。',
      );
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        return this.error(error.message, error.getStatus());
      }
      return this.error(
        'MFA 验证过程中发生内部错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
