/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-22 14:05:57
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-22 14:06:02
 * @FilePath: /sbng_cake/shareholder_services/src/common/dtos/email-password.dto.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class EmailPasswordDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址。' })
  @IsNotEmpty({ message: '邮箱不能为空。' })
  email: string;

  @IsString({ message: '密码必须是字符串。' })
  @IsNotEmpty({ message: '密码不能为空。' })
  @MinLength(8, { message: '密码长度不能少于 8 位。' }) // 建议设置最小密码长度
  password: string;
}
