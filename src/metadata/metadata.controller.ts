/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-06 20:32:32
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-12 11:21:28
 * @FilePath: /shareholder_services/src/metadata/metadata.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { MetadataService } from './metadata.service';
import { Public } from 'src/common/decorators/public.decorator';
import { BaseController } from 'src/common/base';
import { OpenSeaInterceptor } from './metadata.Interceptor';

@Controller('metadata')
@UseInterceptors(OpenSeaInterceptor)
export class MetadataController extends BaseController {
  private readonly logger = new Logger(MetadataController.name);
  constructor(private readonly metadataService: MetadataService) {
    super();
  }

  /**
   * OpenSea 元数据查询接口
   * @param id NFT 的 token ID
   * @returns NFT 元数据
   */
  @Get('token-id/:id')
  @Public()
  async getNftMetadata(@Param('id') id: string) {
    try {
      const tokenId = id;

      this.logger.log(`收到 token ID ${tokenId} 的元数据请求`);
      return await this.metadataService.getNftMetadataFromGraphNgrok(tokenId);
    } catch (error) {
      this.logger.error(
        `处理 token ID ${id} 的元数据请求时出错: ${error.message}`,
      );

      // 对于 OpenSea，我们需要返回一个有效的 JSON 响应，即使是错误
      if (error instanceof NotFoundException) {
        return {
          name: `Unknown NFT #${id}`,
          description: '未找到此 NFT 的元数据',
          image:
            'https://teal-gigantic-bison-996.mypinata.cloud/ipfs/bafkreifpsa4hhi5ez3ccxtktdz2xgzwnn7xamziyigfoxvh5fh2wpfdmue',
        };
      }

      throw error;
    }
  }
}
