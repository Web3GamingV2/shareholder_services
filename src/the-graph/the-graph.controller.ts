/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-24 14:26:18
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-24 15:46:14
 * @FilePath: /sbng_cake/shareholder_services/src/the-graph/the-graph.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Controller, Get, Logger, Param } from '@nestjs/common';
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

  @Get('multi-sig-changes/:id') // 定义带参数的 GET 端点路由
  @Public()
  async getMultiSigChangeById(
    @Param('id') id: string, // 使用 @Param 装饰器获取路由参数
  ): Promise<BaseResponse<MultiSigWalletAdressChanged | null>> {
    this.logger.log(`Received request to get multi-sig change with id: ${id}`);
    try {
      const change = await this.theGraphService.getMultiSigChangesById(id);
      if (!change) {
        // 如果服务层返回 null，表示未找到，抛出 404 异常
        this.logger.warn(`Multi-sig change with id ${id} not found.`);
        // 你可以选择返回 this.error('Not Found', HttpStatus.NOT_FOUND)
        // 或者直接抛出 NestJS 的 NotFoundException
        return this.error('Not Found');
      }
      this.logger.log(`Returning multi-sig change with id: ${id}`);
      return this.success(change); // 返回成功响应，包含找到的数据
    } catch (error) {
      // 捕获 NotFoundException 和其他可能的错误
      this.logger.error(
        `Failed to get multi-sig change with id ${id}: ${error.message}`,
        error.stack,
      );
      // 如果是 NotFoundException，重新抛出，让 NestJS 处理
      // 对于其他错误，使用 BaseController 的 error 方法
      return this.error(`Failed to fetch data: ${error.message}`);
    }
  }
}
