/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-13 23:58:49
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 20:27:54
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
import { UsersModule } from './users/users.module';
import { MoralisService } from './moralis/moralis.service';
import { MoralisModule } from './moralis/moralis.module';
import { TheGraphModule } from './the_graph/the-graph.module';
import { SignService } from './sign/sign.service';
import { SignModule } from './sign/sign.module';
import { InviteController } from './invite/invite.controller';
import { InviteService } from './invite/invite.service';
import { InviteModule } from './invite/invite.module';
import { UserRolesService } from './user_roles/user_roles.service';
import { UserRolesModule } from './user_roles/user_roles.module';
import { SafeWalletsModule } from './safe_wallets/safe_wallets.module';
import { CacheService } from './cache/cache.service';
import { CacheModule } from './cache/cache.module';

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
        MORALIS_API_KEY: Joi.string().required(),
        THE_GRAPH_API_KEY: Joi.string().required(),
        SEPOILA_ALCHEMY_RPC_URL: Joi.string().required(),
        AMOY_ALCHEMY_RPC_URL: Joi.string().required(),
        WEB_PRIVATE_KEY: Joi.string().required(),
      }),
    }),
    SupabaseModule,
    AuthModule,
    RedisModule,
    UsersModule,
    MoralisModule,
    TheGraphModule,
    SignModule,
    InviteModule,
    UserRolesModule,
    SafeWalletsModule,
    CacheModule,
  ],
  controllers: [AppController, InviteController],
  providers: [
    AppService,
    AuthService,
    RedisService,
    MoralisService,
    SignService,
    InviteService,
    UserRolesService,
    CacheService,
  ],
})
export class AppModule {}
