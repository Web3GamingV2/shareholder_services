import { IsNotEmpty, IsString } from 'class-validator';

export class UnenrollTotpDto {
  @IsString({ message: 'Factor ID 必须是字符串。' })
  @IsNotEmpty({ message: 'Factor ID 不能为空。' })
  factorId: string;
}
