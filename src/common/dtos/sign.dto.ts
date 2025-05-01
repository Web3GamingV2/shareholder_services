import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class GetNonceDto {
  @IsNotEmpty({ message: '钱包地址不能为空。' })
  @IsString()
  @IsEthereumAddress({ message: '无效的钱包地址格式。' })
  address: string;
}

export class VerifySiweDto {
  @IsNotEmpty({ message: 'SIWE 消息不能为空。' })
  @IsString()
  message: string;

  @IsNotEmpty({ message: '签名不能为空。' })
  @IsString()
  signature: string;
}
