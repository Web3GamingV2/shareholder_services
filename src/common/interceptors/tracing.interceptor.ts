/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-22 21:16:56
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-30 16:52:59
 * @FilePath: /shareholder_services/src/common/interceptors/tracing.interceptor.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { SpanStatusCode } from '@opentelemetry/api';
import { TraceService } from '../utils/opentelemetry';

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const tracer = TraceService.getTracer();
    if (!tracer) {
      return next.handle();
    }

    const spanName = `${req.method} ${req.path}`;
    return new Observable((observer) => {
      tracer.startActiveSpan(spanName, async (span) => {
        try {
          // 添加一些标准属性
          span.setAttribute('http.method', req.method);
          span.setAttribute('http.url', req.url);
          span.setAttribute('http.user_agent', req.headers['user-agent'] || '');
          span.addEvent('http.request.start');

          // 添加自定义属性
          span.setAttribute('custom.userId', req.user?.id || '');

          const spanContext = span.spanContext();
          console.log(
            `Tracing - ${spanName} - TraceId: ${spanContext.traceId} - SpanId: ${spanContext.spanId}`,
          );
          // 传递 span 到上下文中
          req.spanId = spanContext.spanId;
          req.traceId = spanContext.traceId;

          // 执行原有逻辑
          next
            .handle()
            .pipe(
              tap(() => {
                span.setStatus({ code: SpanStatusCode.OK });
                span.addEvent('http.request.success');
                span.end();
              }),
              catchError((err) => {
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: err.message,
                });
                span.recordException(err);
                span.end();
                throw err;
              }),
            )
            .subscribe(observer);
        } catch (err) {
          span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
          span.recordException(err);
          span.end();
          observer.error(err);
        }
      });
    });
  }
}
