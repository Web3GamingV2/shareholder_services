/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-07 07:42:49
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-07 07:43:15
 * @FilePath: /shareholder_services/src/metadata/metadata.Interceptor.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class OpenSeaInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OpenSeaInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userAgent = request.headers['user-agent'] || '';
    const referer = request.headers['referer'] || '';

    // 检查请求是否来自 OpenSea
    const isOpenSea =
      userAgent.toLowerCase().includes('opensea') ||
      referer.toLowerCase().includes('opensea');

    if (isOpenSea) {
      this.logger.log(`检测到 OpenSea 请求: ${request.url}`);
      // 这里可以添加额外的 OpenSea 请求处理逻辑
      // 例如：限流、特殊响应格式等
    }

    // 将 isOpenSea 标志添加到请求对象中，以便在控制器中使用
    request.isOpenSea = isOpenSea;

    return next.handle().pipe(
      tap(() => {
        if (isOpenSea) {
          this.logger.log(`已处理 OpenSea 请求: ${request.url}`);
        }
      }),
    );
  }
}
