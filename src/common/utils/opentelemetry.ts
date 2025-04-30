/* eslint-disable @typescript-eslint/no-var-requires */
const Resource = require('@opentelemetry/resources');
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
// 导入新的 Semantic Conventions
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_HOST_NAME,
} from '@opentelemetry/semantic-conventions';
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
  BatchSpanProcessor,
  SpanProcessor, // 导入 SpanProcessor 类型
} from '@opentelemetry/sdk-trace-base';
import {
  trace,
  context,
  Span,
  Tracer,
  INVALID_SPAN_CONTEXT,
  SpanStatusCode, // 导入 SpanStatusCode
} from '@opentelemetry/api';
import { hostname } from 'os';
import { diag } from '@opentelemetry/api'; // 用于内部日志

interface TracingConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  exporterUrl: string;
  enableConsoleExporter?: boolean;
}

export class TraceService {
  private static provider: NodeTracerProvider;
  private static initialized = false;
  private static tracer: Tracer; // 存储 Tracer 实例

  /**
   * 初始化 OpenTelemetry 追踪服务
   * @param config 追踪配置
   */
  static initialize(config: TracingConfig): void {
    if (this.initialized) {
      diag.warn('TraceService is already initialized.');
      return;
    }

    try {
      diag.info('Initializing TraceService...');

      // 1. 创建资源属性 (使用新的 Semantic Conventions)
      const resource = Resource.resourceFromAttributes({
        [SEMRESATTRS_HOST_NAME]: hostname(),
        [SEMRESATTRS_SERVICE_NAME]: config.serviceName,
        [SEMRESATTRS_SERVICE_VERSION]: config.serviceVersion,
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: config.environment,
      });

      // 2. 配置导出器
      const otlpExporter = new OTLPTraceExporter({
        url: config.exporterUrl,
        headers: {},
      });

      // 3. 创建 Span Processors 数组
      const spanProcessors: SpanProcessor[] = [
        new BatchSpanProcessor(otlpExporter),
      ];

      // 可选：添加控制台导出器
      if (config.enableConsoleExporter) {
        diag.info('ConsoleSpanExporter enabled.');
        spanProcessors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
      }

      // 4. 创建并配置 Provider，直接传入 processors
      this.provider = new NodeTracerProvider({
        resource: resource,
        spanProcessors: spanProcessors, // 在构造函数中传递 processors
      });

      // 5. 注册 Provider (在新版本中通常是必须的，以设置全局 provider)
      this.provider.register();
      console.info('NodeTracerProvider registered.');

      // 6. 注册 Instrumentations
      registerInstrumentations({
        tracerProvider: this.provider,
        instrumentations: [
          new HttpInstrumentation(), // 自动追踪 HTTP 请求
          new ExpressInstrumentation(), // 自动追踪 Express 中间件和路由
        ],
      });

      console.info('Instrumentations registered.');

      // 7. 获取 Tracer
      this.tracer = trace.getTracer(config.serviceName, config.serviceVersion);
      this.initialized = true;
      console.info('TraceService initialized successfully.');
    } catch (error) {
      console.log('Failed to initialize TraceService:', error);
      // 根据需要决定是否抛出错误或进行其他处理
      // throw error;
    }
  }

  static getTracer(): Tracer | undefined {
    if (!this.initialized || !this.tracer) {
      diag.warn('Attempted to get tracer before TraceService was initialized.');
      return undefined;
    }
    return this.tracer;
  }

  /**
   * 获取当前活动的 span
   * @returns 当前 span 或 undefined
   */
  static getCurrentSpan(): Span | undefined {
    return trace.getSpan(context.active());
  }

  /**
   * 为当前 span 添加事件
   * @param name 事件名称
   * @param attributes 事件属性
   */
  static addEvent(name: string, attributes?: Record<string, any>): void {
    const currentSpan = this.getCurrentSpan();
    if (currentSpan) {
      currentSpan.addEvent(name, attributes);
    } else {
      diag.warn(`Cannot add event "${name}". No active span.`);
    }
  }

  /**
   * 为当前 span 添加属性
   * @param key 属性键
   * @param value 属性值
   */
  static setAttribute(key: string, value: string | number | boolean): void {
    const currentSpan = this.getCurrentSpan();
    if (currentSpan) {
      currentSpan.setAttribute(key, value);
    } else {
      diag.warn(`Cannot set attribute "${key}". No active span.`);
    }
  }

  /**
   * 创建新的子 span 来包裹一个异步操作
   * @param name span 名称
   * @param fn 要执行的异步函数，接收创建的 span 作为参数
   * @returns 函数执行结果
   */
  static async createSpan<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
  ): Promise<T> {
    if (!this.initialized || !this.tracer) {
      diag.error(
        `TraceService not initialized properly. Executing function "${name}" without creating a new span.`,
      );
      // 提供一个非记录状态的 span 或根据需要处理
      const nonRecordingSpan = trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
      try {
        // 仍然执行函数，但不创建新的追踪 span
        return await fn(nonRecordingSpan);
      } catch (error) {
        diag.error(
          `Error during execution of "${name}" without tracing:`,
          error,
        );
        throw error; // 重新抛出错误
      }
    }

    // 使用存储的 tracer 创建并激活新的 span
    return await this.tracer.startActiveSpan(name, async (span) => {
      try {
        // 执行传入的函数
        const result = await fn(span);
        // 成功结束 span
        span.setStatus({ code: SpanStatusCode.OK });
        span.end();
        return result;
      } catch (error) {
        diag.error(`Error during traced operation "${name}":`, error);
        // 记录异常信息到 Span
        if (error instanceof Error) {
          span.recordException(error);
        } else {
          span.recordException(String(error)); // 记录非 Error 类型的错误
        }
        // 设置 Span 状态为 Error
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : String(error),
        });
        span.end(); // 确保即使出错也结束 span
        throw error; // 重新抛出错误，以便上层代码可以处理
      }
    });
  }

  /**
   * 关闭 OpenTelemetry Provider
   * 确保所有缓冲的 spans 被导出。应在应用关闭前调用。
   */
  static async shutdown(): Promise<void> {
    if (this.initialized && this.provider) {
      diag.info('Shutting down OpenTelemetry provider...');
      try {
        await this.provider.shutdown();
        diag.info('OpenTelemetry provider shut down successfully.');
        this.initialized = false;
      } catch (error) {
        diag.error('Error shutting down OpenTelemetry provider:', error);
      }
    } else {
      diag.warn(
        'TraceService shutdown called but not initialized or provider missing.',
      );
    }
  }
}
