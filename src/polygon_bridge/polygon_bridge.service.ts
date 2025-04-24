/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-24 21:32:36
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-24 21:56:39
 * @FilePath: /sbng_cake/shareholder_services/src/polygon_bridge/polygon_bridge.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PolygonBridgeService implements OnModuleInit {
  onModuleInit() {
    console.log('PolygonBridgeService initialized');
  }
}
