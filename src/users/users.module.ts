/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 20:49:44
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-22 10:33:07
 * @FilePath: /sbng_cake/shareholder_services/src/users/users.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
