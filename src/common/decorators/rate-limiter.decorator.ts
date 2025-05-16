import {
  SetMetadata,
  UseGuards,
  applyDecorators,
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service'; // 确保路径正确

export const RATE_LIMITER_KEY_METADATA = 'rate_limiter_key';
export const RATE_LIMITER_LIMIT_METADATA = 'rate_limiter_limit';
export const RATE_LIMITER_WINDOW_METADATA = 'rate_limiter_window';

export interface RateLimitOptions {
  keyPrefix: string; // 用于生成 Redis 键的前缀，例如 'getNonce' 或 'verifySiwe'
  limit: number; // 时间窗口内的最大请求数
  windowInSeconds: number; // 时间窗口大小 (秒)
  useIp?: boolean; // 是否使用 IP 地址作为限流键的一部分，默认为 true
  useAddress?: boolean; // 是否从请求体或查询参数中提取 address 作为限流键的一部分，默认为 false
  addressPath?: string; // 如果 useAddress 为 true，指定 address 在请求体/查询参数中的路径，例如 'body.message.address' 或 'query.address'
}

export function RateLimit(options: RateLimitOptions) {
  return applyDecorators(
    SetMetadata(RATE_LIMITER_KEY_METADATA, options.keyPrefix),
    SetMetadata(RATE_LIMITER_LIMIT_METADATA, options.limit),
    SetMetadata(RATE_LIMITER_WINDOW_METADATA, options.windowInSeconds),
    SetMetadata('rateLimitOptions', options), // 存储完整的选项供 Guard 使用
    UseGuards(RateLimiterGuard),
  );
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<RateLimitOptions>(
      'rateLimitOptions',
      context.getHandler(),
    );
    if (!options) {
      return true; // 如果没有提供选项，则不进行限流
    }

    const request = context.switchToHttp().getRequest<Request>();
    let identifier = '';

    if (options.useIp !== false) {
      // 默认为 true
      identifier += request.ip;
    }

    if (options.useAddress && options.addressPath) {
      const address = this.getAddressFromRequest(request, options.addressPath);
      if (address) {
        identifier += `:${address}`;
      }
    }

    if (!identifier) {
      // 如果没有有效的标识符（例如，IP 和地址都未启用或未找到），则不进行限流，或者抛出配置错误
      console.warn(
        'RateLimiterGuard: No identifier found for rate limiting. Skipping.',
      );
      return true;
    }

    const rateLimitRedisKey = `rate-limit:${options.keyPrefix}:${identifier}`;
    const allowed = await this.redisService.rateLimit(
      rateLimitRedisKey,
      options.limit,
      options.windowInSeconds,
    );

    if (!allowed) {
      throw new HttpException(
        '请求过于频繁，请稍后再试。',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getAddressFromRequest(
    request: Request,
    path: string,
  ): string | undefined {
    const parts = path.split('.');
    let value: any = request;
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    return typeof value === 'string' ? value : undefined;
  }
}
