/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 20:51:23
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 18:29:39
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
}
