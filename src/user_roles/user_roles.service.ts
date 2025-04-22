import {
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { ADMIN_EMAILS_KEY } from 'src/common/constants/redis';
import { RedisService } from 'src/redis/redis.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { UserRole } from './user_roles.interface';

@Injectable()
export class UserRolesService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 为新注册用户分配角色
   * @param userId 用户ID
   * @param email 用户邮箱
   */
  async assignRoleToNewUser(
    userId: string,
    email: string,
  ): Promise<{ role: string }> {
    try {
      if (!userId || !email) {
        throw new HttpException('用户ID和邮箱不能为空', HttpStatus.BAD_REQUEST);
      }

      const supabase = this.supabaseService.supabaseAdmin;
      // 1. 从 Redis 获取管理员邮箱列表
      const adminEmails =
        (await this.redisService.get<string[]>(ADMIN_EMAILS_KEY)) || [];

      // 2. 确定用户角色
      const isAdmin = adminEmails.includes(email.toLowerCase());
      const roleType = isAdmin ? UserRole.ADMIN : UserRole.MEMBER;

      // 3. 从 roles 表获取对应的角色 ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', roleType)
        .single();

      if (roleError) {
        throw new InternalServerErrorException('获取角色信息失败');
      }

      if (!roleData?.id) {
        throw new NotFoundException('角色配置不存在');
      }

      // 4. 在 user_roles 表中创建关联记录
      const { error: insertError } = await supabase.from('user_roles').insert({
        user_id: userId,
        role_id: roleData.id,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        throw new InternalServerErrorException('分配用户角色失败');
      }

      return { role: roleType };
    } catch (error) {
      // 如果是已知的 HTTP 异常，直接抛出
      if (error instanceof HttpException) {
        throw error;
      }
      // 其他未知错误，包装为 InternalServerErrorException
      throw new InternalServerErrorException('分配用户角色时发生内部错误');
    }
  }

  /**
   * 为用户分配默认成员角色
   * @param userId 用户ID
   */
  async assignDefaultMemberRole(userId: string): Promise<{ role: string }> {
    try {
      if (!userId) {
        throw new HttpException('用户ID不能为空', HttpStatus.BAD_REQUEST);
      }

      const supabase = this.supabaseService.supabaseAdmin;

      // 1. 获取 member 角色的 ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', UserRole.MEMBER)
        .single();

      if (roleError) {
        throw new InternalServerErrorException('获取角色信息失败');
      }

      if (!roleData?.id) {
        throw new NotFoundException('角色配置不存在');
      }

      // 2. 创建用户角色关联记录
      const { error: insertError } = await supabase.from('user_roles').insert({
        user_id: userId,
        role_id: roleData.id,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        throw new InternalServerErrorException('分配用户角色失败');
      }

      return { role: UserRole.MEMBER };
    } catch (error) {
      // 如果是已知的 HTTP 异常，直接抛出
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('分配用户角色时发生内部错误');
    }
  }
}
