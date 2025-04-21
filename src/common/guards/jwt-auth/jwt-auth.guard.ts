/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 22:10:45
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-21 22:13:49
 * @FilePath: /sbng_cake/shareholder_services/src/guards/jwt-auth/jwt-auth.guard.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator'; // Adjust path if needed
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Assuming your strategy is named 'jwt'
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route handler or controller has the @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // Check method level first
      context.getClass(), // Then check class level
    ]);

    if (isPublic) {
      // If @Public() is present, bypass JWT validation
      return true;
    }

    // If not public, proceed with the standard JWT validation provided by AuthGuard('jwt')
    return super.canActivate(context);
  }

  // Optional: Handle request can be overridden if needed, but often not necessary when extending AuthGuard
  // handleRequest(err, user, info, context, status) {
  //   if (err || !user) {
  //     // Check if it's public again just in case, though canActivate should handle it
  //     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
  //       context.getHandler(),
  //       context.getClass(),
  //     ]);
  //     if (isPublic) return true; // Or return null/undefined depending on how you want unauthenticated public routes handled downstream

  //     // Otherwise, throw the standard UnauthorizedException
  //     throw err || new UnauthorizedException();
  //   }
  //   return user;
  // }
}
