/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-19 22:44:59
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-19 23:00:42
 * @FilePath: /shareholder_services/src/common/dtos/airdrop/create-airdrop.dto.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateAirdropDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  tokenAddress: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;

  @IsArray()
  recipients: {
    address: string;
    amount: string;
  }[];
}
