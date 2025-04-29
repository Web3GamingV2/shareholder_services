// /*
//  * @Author: leelongxi leelongxi@foxmail.com
//  * @Date: 2025-04-22 21:16:56
//  * @LastEditors: leelongxi leelongxi@foxmail.com
//  * @LastEditTime: 2025-04-22 21:18:05
//  * @FilePath: /sbng_cake/shareholder_services/src/common/interceptors/tracing.interceptor.ts
//  * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
//  */
// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { Observable, throwError } from 'rxjs';
// import { catchError, tap } from 'rxjs/operators';
// import { TraceService } from '../utils/opentelemetry'; // 确保路径正确
// import { SpanStatusCode, Span, trace } from '@opentelemetry/api';
// import { SemanticAttributes } from '@opentelemetry/semantic-conventions'; // 用于标准属性

// @Injectable()
// export class TracingInterceptor implements NestInterceptor {
//   intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
//     const tracer = TraceService.getTracer();
//     if (!tracer) {
//       // 如果追踪未初始化，则直接执行，不创建 Span
//       return next.handle();
//     }

//     const handler = context.getHandler();
//     const controller = context.getClass();
//     const spanName = `${controller.name}.${handler.name}`; // e.g., "UsersController.findAll"

//     // 尝试从现有上下文中获取父 Span (例如由 HttpInstrumentation 创建的)
//     const parentSpan = TraceService.getCurrentSpan();
//     const ctx = parentSpan
//       ? trace.setSpan(context.active(), parentSpan)
//       : undefined;

//     // 使用 startActiveSpan 创建新的子 Span 并激活它
//     return tracer.startActiveSpan(
//       spanName,
//       (span: Span) => {
//         // 添加一些通用的属性
//         span.setAttribute(SemanticAttributes.CODE_NAMESPACE, controller.name);
//         span.setAttribute(SemanticAttributes.CODE_FUNCTION, handler.name);

//         // 处理请求 (next.handle() 返回 Observable)
//         return next.handle().pipe(
//           tap({
//             next: () => {
//               // 成功完成
//               span.setStatus({ code: SpanStatusCode.OK });
//             },
//             // 注意：complete 不一定表示成功，只是流结束
//           }),
//           catchError((error) => {
//             // 发生错误
//             span.recordException(error); // 记录异常
//             span.setStatus({
//               code: SpanStatusCode.ERROR,
//               message: error.message,
//             });
//             // 重新抛出错误，以便 NestJS 的异常过滤器可以处理
//             return throwError(() => error);
//           }),
//           // 使用 finalize 确保无论成功、失败还是取消，span 都被结束
//           tap({
//             finalize: () => {
//               span.end(); // 结束 Span
//             },
//           }),
//         );
//       },
//       undefined,
//       ctx,
//     ); // 传入父上下文
//   }
// }
