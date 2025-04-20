/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-19 11:15:12
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-20 13:50:02
 * @FilePath: /sbng_cake/shareholder_services/src/auth/auth.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from 'src/supabase/supabase.service';
import { VerifyInviteDto } from '../dtos/verify-invite.dto';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  async verifyInvite(
    verifyInviteDto: VerifyInviteDto,
  ): Promise<{ nonce: string }> {
    console.log(verifyInviteDto);
    return {
      nonce: '1234',
    };
  }

  async getNonce(): Promise<string> {
    return '123456';
  }

  async loginOrRegister(loginDto: LoginDto): Promise<void> {
    console.log(loginDto);
  }
}
