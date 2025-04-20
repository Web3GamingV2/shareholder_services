/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-13 23:58:49
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-20 14:17:25
 * @FilePath: /sbng_cake/shareholder_services/src/app.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';

const envFilePath = [`.env.${process.env.NODE_ENV || 'development'}`, '.env'];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath,
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3306),
        SUPABASE_URL: Joi.string().required(),
        SUPABASE_KEY: Joi.string().required(),
        SUPABASE_JWT_SECRET: Joi.string().required(),
        UPSTASH_REDIS_REST_URL: Joi.string().required(),
        UPSTASH_REDIS_REST_TOKEN: Joi.string().required(),
      }),
    }),
    SupabaseModule,
    AuthModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, AuthService, RedisService],
})
export class AppModule {}
