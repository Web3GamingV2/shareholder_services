import { Module } from '@nestjs/common';
import { ChainlinkFuncService } from './chainlink-func.service';
import { ChainlinkFuncController } from './chainlink-func.controller';

@Module({
  exports: [ChainlinkFuncService],
  providers: [ChainlinkFuncService],
  controllers: [ChainlinkFuncController],
})
export class ChainlinkFuncModule {}
