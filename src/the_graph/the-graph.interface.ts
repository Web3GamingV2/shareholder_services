import { PlainLiteralObject } from '@nestjs/common';

/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-24 12:18:40
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-07 07:35:07
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

export interface GraphQlResponse<T> extends PlainLiteralObject {
  data: T;
}

export interface SubscriptionRequestEvent {
  blockNumber: string;
  blockTimestamp: string;
  expiryTimestamp: string;
  id: string;
  patAmount: string;
  subscriptionId: string;
  transactionHash: string;
  usdtAmount: string;
  user: string;
}

export interface SubscriptionRequestEventResponse {
  subscriptionRequestEvents: SubscriptionRequestEvent[];
}

export interface GraphQLClient {
  request: <T>(
    query: string,
    variables?: Record<string, unknown>,
  ) => Promise<T>;
}

export interface SubscriptionRequestVariables extends Record<string, unknown> {
  first?: number;
  skip?: number;
  orderBy?: string; // 或者更具体的枚举类型 e.g., 'blockTimestamp' | 'usdtAmount'
  orderDirection?: 'asc' | 'desc';
  where?: Record<string, any>; // 定义更具体的过滤条件类型 e.g., { user?: string; expiryTimestamp_gt?: string }
}

export interface MintProofEvent extends PlainLiteralObject {
  blockNumber: string;
  blockTimestamp: string;
  id: string;
}

export interface MintProofEventsResponse {
  mintProofEvents: MintProofEvent[];
}
