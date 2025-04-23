/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-19 11:15:21
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-23 19:39:28
 * @FilePath: /sbng_cake/shareholder_services/src/auth/auth.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailPasswordDto } from 'src/common/dtos/email-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    loginDto: EmailPasswordDto,
  ): Promise<any> {
    // 注意：LoginDto 需要能正确接收 SiweMessage 对象
    // 可能需要自定义 Pipe 或调整 DTO
    return this.authService.login(loginDto);
  }
}
