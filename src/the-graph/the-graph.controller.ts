/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-24 14:26:18
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-24 15:00:43
 * @FilePath: /sbng_cake/shareholder_services/src/the-graph/the-graph.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Controller, Get, Logger } from '@nestjs/common';
import { BaseController, BaseResponse } from 'src/common/base';
import { MultiSigWalletAdressChanged } from './the-graph.interface';
import { TheGraphService } from './the-graph.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('the-graph')
export class TheGraphController extends BaseController {
  private readonly logger = new Logger(TheGraphController.name);
  constructor(private readonly theGraphService: TheGraphService) {
    super();
  }

  @Get('multi-sig-changes') // 定义 GET 端点路由
  @Public()
  async getMultiSigChanges(): Promise<
    BaseResponse<MultiSigWalletAdressChanged[]>
  > {
    this.logger.log('Received request to get multi-sig changes.');
    try {
      const changes = await this.theGraphService.getMultiSigChanges();
      this.logger.log(`Returning ${changes.length} multi-sig changes.`);
      return this.success(changes);
    } catch (error) {
      this.logger.error(
        `Failed to get multi-sig changes: ${error.message}`,
        error.stack,
      );
      // 抛出标准的 HTTP 异常
      return this.error(error.message);
    }
  }
}
