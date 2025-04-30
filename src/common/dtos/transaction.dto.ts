/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-22 14:07:17
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-30 21:16:57
 * @FilePath: /sbng_cake/shareholder_services/src/common/dtos/update-wallet.dto.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { IsNotEmpty, IsString } from 'class-validator';

export class TransactionDto {
  @IsString({ message: 'SIWE 消息必须是字符串格式。' })
  @IsNotEmpty({ message: 'SIWE 消息不能为空。' })
  functionName: string; // The SIWE message string

  @IsString({ message: '签名必须是字符串。' })
  @IsNotEmpty({ message: '签名不能为空。' })
  functionAbi: string;

  @IsString({ message: '签名必须是字符串。' })
  @IsNotEmpty({ message: '签名不能为空。' })
  senderAddress: string;
}
