/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-29 21:38:29
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 22:53:56
 * @FilePath: /shareholder_services/src/common/guards/jwt-auth/jwt.strategy.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Request } from 'express';
import { Injectable, PlainLiteralObject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { SUPABASE_JWT_SECRET } from 'src/common/constants/jwt';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(JwtStrategy) {
  constructor(private readonly supabase: SupabaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从 Authorization header 提取 JWT
      secretOrKey: SUPABASE_JWT_SECRET, // 用于解密和验证 JWT
      passReqToCallback: true, // 将请求对象传递给验证回调
    });
  }

  // 此方法返回用户信息，在请求的生命周期中可以通过请求对象访问到这些信息
  async validate(req: Request, payload: PlainLiteralObject) {
    const cacheKey = `${payload.sub}:${payload.session_id}`;
    const supabaseClient = await this.supabase.getSupabaseClient(cacheKey);
    if (!supabaseClient) {
      const access_token = req.headers.authorization.split(' ')[1];
      const refresh_token = req.headers['x-refresh-token'] as string;
      const ttl = payload.exp - payload.iat;
      await this.supabase.createSupabaseClient(
        cacheKey,
        ttl,
        access_token,
        refresh_token,
      );
    }
    return { userId: payload.sub, session_id: payload.session_id }; // 返回用户信息
  }
}
