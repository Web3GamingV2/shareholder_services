import { IsNotEmpty, IsString } from 'class-validator';

export class EnrollTotpDto {
  @IsString({ message: 'User ID 必须是字符串。' })
  @IsNotEmpty({ message: 'User ID 不能为空。' })
  issuer: string;

  @IsString({ message: 'User ID 必须是字符串。' })
  @IsNotEmpty({ message: 'User ID 不能为空。' })
  friendlyName: string;
}
