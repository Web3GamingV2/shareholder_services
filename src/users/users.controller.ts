/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 20:49:56
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 18:33:15
 * @FilePath: /shareholder_services/src/users/users.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Controller, Get, Param } from '@nestjs/common';
import { BaseController, BaseResponse } from 'src/common/base';
import { UsersService } from './users.service';
import { AuthUser } from '@supabase/supabase-js';
import { UserProfile } from './users.interface';

@Controller('users')
export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }
  @Get('auth/:userId')
  async getAuthUserById(
    @Param('userId') userId: string,
  ): Promise<BaseResponse<AuthUser>> {
    try {
      const authUser = await this.usersService.findAuthUserById(userId);
      return this.success(authUser);
    } catch (error) {
      console.error(error);
      return this.error(error);
    }
  }

  @Get('profile/:userId')
  async getUserProfileById(
    @Param('userId') userId: string,
  ): Promise<BaseResponse<UserProfile>> {
    try {
      const userProfile = await this.usersService.findUserProfileById(userId);
      return this.success(userProfile);
    } catch (error) {
      console.error(error);
      return this.error(error);
    }
  }
}
