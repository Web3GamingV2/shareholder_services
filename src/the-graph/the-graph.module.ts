/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 22:38:05
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-24 14:19:32
 * @FilePath: /sbng_cake/shareholder_services/src/the-graph/the-graph.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLRequestModule } from '@golevelup/nestjs-graphql-request';
import { TheGraphService } from './the-graph.service';
import { THE_GRAPH_API } from 'src/common/constants/apis';
import { TheGraphController } from './the-graph.controller';

@Module({
  imports: [
    ConfigModule,
    GraphQLRequestModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        endpoint: THE_GRAPH_API,
        options: {
          headers: {
            Authorization: `Bearer ${configService.get('THE_GRAPH_API_KEY')}`,
          },
        },
      }),
    }),
  ],
  providers: [TheGraphService],
  exports: [TheGraphService],
  controllers: [TheGraphController],
})
export class TheGraphModule {}
