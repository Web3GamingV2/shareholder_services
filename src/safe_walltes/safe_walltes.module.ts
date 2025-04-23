import { Module } from '@nestjs/common';
import { SafeWalltesService } from './safe_walltes.service';
import { SafeWalltesController } from './safe_walltes.controller';

@Module({
  providers: [SafeWalltesService],
  controllers: [SafeWalltesController]
})
export class SafeWalltesModule {}
