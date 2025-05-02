import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { BaseController, BaseResponse } from 'src/common/base';
import { PatSubscriptionsService } from './pat_subscriptions.service';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('pat-subscriptions')
export class PatSubscriptionsController extends BaseController {
  constructor(
    private readonly patSubscriptionsService: PatSubscriptionsService,
  ) {
    super();
  }
  /**
   * 获取 InvestorSalePool 合约的版本号。
   * @returns 返回包含版本号字符串的响应对象。
   */
  @Get('contract-version/:address') // 定义 GET 路由
  @Public()
  async getContractVersion(
    @Param('address') address: string,
  ): Promise<BaseResponse<{ version: string }>> {
    try {
      const version =
        await this.patSubscriptionsService.contractsCaller.contractVersion(
          address,
        );
      // 使用 BaseController 的 success 方法包装成功响应
      return this.success({ version });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // 否则包装成内部服务器错误
      throw new HttpException(
        '获取合约版本号时发生内部错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
