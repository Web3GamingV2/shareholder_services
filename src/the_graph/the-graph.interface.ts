/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-24 12:18:40
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-24 15:27:35
 * @FilePath: /sbng_cake/shareholder_services/src/the-graph/the-graph.interface.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface MultiSigWalletAdressChanged {
  id: string;
  blockTimestamp: string;
  from: string;
  newAddr: string;
  oldAddr: string;
  transactionHash: string;
  blockNumber: string;
}

export interface SingleChangeResponse {
  multiSigWalletAdressChanged: MultiSigWalletAdressChanged;
}

export interface GraphQlResponse<T> {
  multiSigWalletAdressChangeds: T;
}

export interface GraphQLClient {
  request: <T>(
    query: string,
    variables?: Record<string, unknown>,
  ) => Promise<T>;
}
