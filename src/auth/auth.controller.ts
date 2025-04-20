/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-19 11:15:21
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-20 18:42:27
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
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dtos/login.dto';
import { NonceRequestDto } from 'src/dtos/nonce-request.dto';
import { BaseResponse } from 'src/common/base';
import { ActivateDto } from 'src/dtos/activate.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Endpoint to get nonce
  @Get('nonce')
  @HttpCode(HttpStatus.OK)
  async getNonce(
    @Query(new ValidationPipe()) query: NonceRequestDto,
  ): Promise<BaseResponse<{ nonce: string }>> {
    return this.authService.getNonce(query.address);
  }

  // Activation Endpoint
  @Post('activate')
  @HttpCode(HttpStatus.OK)
  async activate(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    activateDto: ActivateDto,
  ): Promise<
    BaseResponse<{ status: string; userId?: string; message?: string }>
  > {
    // Use BaseResponse
    const result = await this.authService.activateWithInvite(activateDto);
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    loginDto: LoginDto,
  ): Promise<any> {
    // 注意：LoginDto 需要能正确接收 SiweMessage 对象
    // 可能需要自定义 Pipe 或调整 DTO
    return this.authService.login(loginDto);
  }
}
