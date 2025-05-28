// request-context.service.ts
import { Injectable, PlainLiteralObject } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext extends PlainLiteralObject {
  traceId?: string;
  userId?: string;
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run(context: RequestContext, fn: (...args: any[]) => any) {
    return this.storage.run(context, fn);
  }

  get<T = any>(key: keyof RequestContext): T | undefined {
    const store = this.storage.getStore();
    return store?.[key] as T;
  }

  getContext(): RequestContext | undefined {
    return this.storage.getStore();
  }
}
