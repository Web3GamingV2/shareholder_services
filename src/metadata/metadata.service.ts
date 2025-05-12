/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-06 20:32:24
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-12 11:19:29
 * @FilePath: /shareholder_services/src/metadata/metadata.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { tryJsonParse } from 'src/common/utils';
import { PinataService } from 'src/pinata/pinata.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { TheGraphService } from 'src/the_graph/the-graph.service';

/**
 * Metadata service
 * 使用签名防伪装接口
 * 支持地址级别动态（如 /metadata/:id/:wallet）
 * 使用 IPFS 发布（如 Pinata）
 * 自动上传图片至 IPFS，并替换 image 字段
 */
@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);

  constructor(
    private readonly theGraphService: TheGraphService,
    private readonly pinataService: PinataService,
    private readonly supbaseService: SupabaseService,
  ) {}

  async getNftMetadataFromGraphNgrok(tokenId: string): Promise<any> {
    try {
      this.logger.log(
        `从 The Graph 获取 token ID ${tokenId} 的 MintProof 事件`,
      );
      const metadata = {
        name: `Shareholder NFT #${tokenId}`,
        description: '股东权益 NFT，代表持有者的股东身份和权益',
        image:
          'https://teal-gigantic-bison-996.mypinata.cloud/ipfs/bafkreifpsa4hhi5ez3ccxtktdz2xgzwnn7xamziyigfoxvh5fh2wpfdmue',
        attributes: [],
        properties: {},
      };
      this.logger.log(`成功从 The Graph 获取 token ID ${tokenId} 的元数据`);
      return metadata;
    } catch (error) {
      this.logger.error(
        `从 The Graph 获取 token ID ${tokenId} 的元数据时出错: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * 通过 The Graph 查询 MintProof 事件并获取元数据 + 前端传递一部分申购数据
   * @param tokenId NFT 的 token ID
   * @returns 基于 MintProof 事件的 NFT 元数据
   */
  async getNftMetadataFromGraph(tokenId: number): Promise<any> {
    try {
      this.logger.log(
        `从 The Graph 获取 token ID ${tokenId} 的 MintProof 事件`,
      );

      // 这里需要根据实际的 GraphQL 查询和接口进行调整
      // 假设我们有一个查询 MintProof 事件的方法
      const mintProofEvents = await this.theGraphService.getMintProofEvents({
        where: {
          tokenId: tokenId.toString(),
        },
      });

      if (!mintProofEvents || mintProofEvents.length === 0) {
        this.logger.warn(`未找到 token ID ${tokenId} 的 MintProof 事件`);
        throw new NotFoundException(
          `未找到 token ID ${tokenId} 的 MintProof 事件`,
        );
      }

      // 获取最新的 MintProof 事件
      const latestEvent = mintProofEvents[0];
      const data = latestEvent.data;
      const parseData = tryJsonParse(data);
      // 构建元数据
      const metadata = {
        name: `Shareholder NFT #${tokenId}`,
        description: '股东权益 NFT，代表持有者的股东身份和权益',
        image:
          'https://teal-gigantic-bison-996.mypinata.cloud/ipfs/bafkreifpsa4hhi5ez3ccxtktdz2xgzwnn7xamziyigfoxvh5fh2wpfdmue',
        attributes: [
          {
            trait_type: 'Round',
            value: parseData.round || 1,
          },
          {
            trait_type: 'Amount',
            value: parseData.amount || 0,
          },
        ],
        properties: {
          wallet: latestEvent.wallet,
          timestamp: latestEvent.timestamp,
          transactionHash: latestEvent.transactionHash,
        },
      };

      this.logger.log(`成功从 The Graph 获取 token ID ${tokenId} 的元数据`);
      return metadata;
    } catch (error) {
      this.logger.error(
        `从 The Graph 获取 token ID ${tokenId} 的元数据时出错: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
