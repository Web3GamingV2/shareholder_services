import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { SiweMessage } from 'siwe';

export class ActivateDto {
  @IsNotEmpty()
  @IsString()
  inviteCode: string;

  @IsNotEmpty()
  @IsObject() // Consider more specific validation if possible
  message: SiweMessage; // SIWE message used for activation signature

  @IsNotEmpty()
  @IsString()
  signature: string; // Signature for the activation SIWE message
}
