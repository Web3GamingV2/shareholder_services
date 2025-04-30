/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-13 23:58:49
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-30 16:54:02
 * @FilePath: /sbng_cake/shareholder_services/src/main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './common/guards/jwt-auth/jwt-auth.guard';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { TraceService } from './common/utils/opentelemetry';
import { TraceInterceptor } from './common/interceptors/tracing.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');

  const reflector = app.get(Reflector);

  TraceService.initialize({
    serviceName: 'shareholder_services',
    serviceVersion: '1.0.0',
    environment: 'production',
    exporterUrl:
      'http://tracing-analysis-dc-sg.aliyuncs.com/adapt_ggxsl4z02x@1a673e9921f66e4_ggxsl4z02x@53df7ad2afe8301/api/otlp/traces',
    enableConsoleExporter: false,
  });

  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted values are provided
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );
  app.useGlobalInterceptors(new TraceInterceptor());

  const config = app.get(ConfigService);
  const port = config.get('PORT', 3306);
  await app.listen(port);
}
bootstrap();
