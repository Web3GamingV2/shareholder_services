/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 20:51:23
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-22 15:25:01
 * @FilePath: /sbng_cake/shareholder_services/src/users/users.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';
import { BaseController, BaseResponse } from 'src/common/base';
import { PGRST116 } from 'src/common/constants/code';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UserProfile } from './users.interface';

@Injectable()
export class UsersService extends BaseController {
  constructor(private readonly supabaseService: SupabaseService) {
    super();
  }

  async findAuthUserById(userId: string): Promise<BaseResponse<AuthUser>> {
    if (!userId) {
      return this.error('无效的用户 ID。', HttpStatus.BAD_REQUEST);
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
          return this.error(
            `找不到 ID 为 ${userId} 的认证用户。`,
            HttpStatus.NOT_FOUND,
          );
        }
        return this.error(
          `获取认证用户信息时出错: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Supabase might return data.user structure
      const authUser = data?.user;

      if (!authUser) {
        return this.error(
          `找不到 ID 为 ${userId} 的认证用户数据。`,
          HttpStatus.NOT_FOUND,
        );
      }
      return this.success<AuthUser>(authUser, '认证用户信息获取成功。');
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        return this.error(error.message, error.getStatus());
      }
      return this.error(
        '获取认证用户信息时发生内部错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findUserProfileById(
    userId: string,
  ): Promise<BaseResponse<UserProfile>> {
    if (!userId) {
      return this.error('无效的用户 ID。', HttpStatus.BAD_REQUEST);
    }

    const supabase = this.supabaseService.supabaseAdmin;

    try {
      const { data, error } = await supabase
        .from('profiles') // Target the 'profiles' table
        .select('*') // Select all columns, or specify needed columns: 'user_id, email, wallet_address, username'
        .eq('user_id', userId) // Filter by the user ID
        .maybeSingle(); // Expect 0 or 1 result, returns null if not found

      if (error && error.code !== PGRST116) {
        throw new InternalServerErrorException(
          `获取用户信息时出错: ${error.message}`,
        );
      }

      if (!data) {
        throw new NotFoundException(`找不到用户 ID 为 ${userId} 的用户信息。`);
      }

      return this.success<UserProfile>(data, '用户信息获取成功。');
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        return this.error(error.message, error.getStatus());
      }
      return this.error(
        '获取用户信息时发生内部错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
