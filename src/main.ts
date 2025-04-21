/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-13 23:58:49
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-21 22:30:50
 * @FilePath: /sbng_cake/shareholder_services/src/main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './common/guards/jwt-auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');

  const reflector = app.get(Reflector);

  app.useGlobalGuards(new JwtAuthGuard(reflector));

  const config = app.get(ConfigService);
  const port = config.get('PORT', 3306);
  await app.listen(port);
}
bootstrap();
