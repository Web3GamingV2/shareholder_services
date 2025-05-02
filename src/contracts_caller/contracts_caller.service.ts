/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-02 12:37:56
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-02 15:54:44
 * @FilePath: /shareholder_services/src/contracts_caller/contracts_caller.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MoralisService } from 'src/moralis/moralis.service';
import { sepoliaNetworkConfig } from 'src/common/constants/safeWallet';
import { Interface } from 'ethers';
import { tryJsonParse } from 'src/common/utils';

@Injectable()
export class ContractsCallerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly moralisService: MoralisService, // Inject the MoralisService here
  ) {}

  async contractVersion(contractAddress: string) {
    try {
      const iface = new Interface(['function version() view returns (string)']);
      const fragment = iface.getFunction('version');
      const versionString = await this.moralisService.runContractFunction(
        contractAddress,
        'version',
        [tryJsonParse(fragment.format('json'))],
        {},
        sepoliaNetworkConfig.chainId + '',
      );
      return versionString;
    } catch (error) {
      throw error;
    }
  }
}
