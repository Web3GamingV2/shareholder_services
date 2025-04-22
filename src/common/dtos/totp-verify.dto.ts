/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-22 14:06:24
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-22 14:44:21
 * @FilePath: /sbng_cake/shareholder_services/src/common/dtos/totp-verify.dto.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class TotpVerifyDto {
  @IsString({ message: 'Factor ID 必须是字符串。' })
  @IsNotEmpty({ message: 'Factor ID 不能为空。' })
  factorId: string;

  @IsString({ message: '验证码必须是字符串。' })
  @IsNotEmpty({ message: '验证码不能为空。' })
  @Length(6, 6, { message: '验证码必须是 6 位数字。' }) // TOTP code is typically 6 digits
  code: string;

  @IsString({ message: 'User ID 必须是字符串。' })
  @IsNotEmpty({ message: 'User ID 不能为空。' })
  userId: string;

  @IsString({ message: 'User ID 必须是字符串。' })
  @IsNotEmpty({ message: 'User ID 不能为空。' })
  accessToken: string;
}
