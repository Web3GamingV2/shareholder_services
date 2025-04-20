/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-20 13:42:06
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-20 13:42:11
 * @FilePath: /sbng_cake/shareholder_services/src/auth/dtos/login.dto.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { SiweMessage } from 'siwe';

export class LoginDto {
  @IsNotEmpty()
  @IsObject() // 或者更具体的验证
  message: SiweMessage; // 前端发送原始消息对象

  @IsNotEmpty()
  @IsString()
  signature: string;
}
