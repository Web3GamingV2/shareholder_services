import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class VerifyInviteDto {
  @IsNotEmpty()
  @IsString()
  inviteCode: string;

  @IsNotEmpty()
  @IsEthereumAddress()
  address: string;
}
