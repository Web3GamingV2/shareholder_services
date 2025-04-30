/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-30 16:56:32
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-30 17:03:05
 * @FilePath: /shareholder_services/src/common/decorators/trace-span.decorator.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Span } from '@opentelemetry/api';
import { TraceService } from '../utils/opentelemetry';

export function TraceSpan(name?: string): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const spanName =
        name || `${target.constructor.name}.${String(propertyKey)}`;
      return TraceService.createSpan(spanName, async (span: Span) => {
        return originalMethod.apply(this, [...args, { span }]);
      });
    };

    return descriptor;
  };
}
