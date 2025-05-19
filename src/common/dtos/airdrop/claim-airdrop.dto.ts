/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-19 22:45:05
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-19 23:00:52
 * @FilePath: /shareholder_services/src/common/dtos/airdrop/claim-airdrop.dto.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { IsNotEmpty, IsString, IsEthereumAddress } from 'class-validator';

export class ClaimAirdropDto {
  @IsNotEmpty()
  @IsString()
  airdropId: string;

  @IsNotEmpty()
  @IsEthereumAddress()
  address: string;

  @IsNotEmpty()
  @IsString()
  signature: string; // 用户签名，用于验证身份
}
