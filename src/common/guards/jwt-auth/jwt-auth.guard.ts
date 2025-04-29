/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 22:10:45
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 22:26:59
 * @FilePath: /sbng_cake/shareholder_services/src/guards/jwt-auth/jwt-auth.guard.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// import * as jwt from 'jsonwebtoken';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator'; // Adjust path if needed
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Check method level first
      context.getClass(), // Then check class level
    ]);

    if (isPublic) {
      return true;
    }

    try {
      const canActivateResult = super.canActivate(context);
      return canActivateResult;
    } catch (error) {
      // 确保异常被抛出，以便 NestJS 处理
      throw error;
    }
  }
}
