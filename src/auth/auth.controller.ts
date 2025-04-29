/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-19 11:15:21
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 19:35:20
 * @FilePath: /sbng_cake/shareholder_services/src/auth/auth.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailPasswordDto } from 'src/common/dtos/email-password.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { BaseResponse, BaseController } from 'src/common/base';
import { Factor, User } from '@supabase/supabase-js';
import { AuthInterface } from './auth.interface';

@Controller('auth')
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Get('list-factors-totp')
  @HttpCode(HttpStatus.OK)
  async listFactorsTotp(): Promise<BaseResponse<Factor[]>> {
    try {
      const factors = await this.authService.listFactorsTotp();
      return this.success(factors);
    } catch (error) {
      console.log(error);
      return this.error(error);
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  async login(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    loginDto: EmailPasswordDto,
  ): Promise<BaseResponse<AuthInterface>> {
    try {
      const userInfo: AuthInterface = await this.authService.login(loginDto);
      return this.success(userInfo);
    } catch (error) {
      console.log(error);
      return this.error(error);
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @Public()
  async register(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    registerDto: EmailPasswordDto,
  ): Promise<BaseResponse<User>> {
    try {
      const userInfo: User = await this.authService.register(registerDto);
      return this.success(userInfo);
    } catch (error) {
      console.log(error);
      return this.error(error);
    }
  }
}
