import { Module } from '@nestjs/common';
import { PolygonBridgeService } from './polygon_bridge.service';
import { PolygonBridgeController } from './polygon_bridge.controller';

@Module({
  providers: [PolygonBridgeService],
  controllers: [PolygonBridgeController]
})
export class PolygonBridgeModule {}
