import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class NonceRequestDto {
  @IsNotEmpty()
  @IsEthereumAddress()
  address: string;
}
