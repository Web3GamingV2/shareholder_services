/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-02 15:05:56
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-02 15:11:27
 * @FilePath: /shareholder_services/src/common/constants/address.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { nodeEnv } from './env';

const developmentContractsAddress = {
  investorSalePoolProxy: '0xC711619c140663737aDe3b54A4B4974C0FC58D8A',
};

const productionContractsAddress = {
  investorSalePoolProxy: '0x9041133828893769200098170876532625009727',
};

export const contractsAddress =
  nodeEnv === 'development'
    ? developmentContractsAddress
    : productionContractsAddress;
