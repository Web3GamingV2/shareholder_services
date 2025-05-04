/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-24 12:16:28
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-04 13:15:23
 * @FilePath: /sbng_cake/shareholder_services/src/common/queries/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { gql } from '../utils/gql';

export const GET_MULTI_SIG_CHANGES = gql`
  query GetMultiSigChanges {
    multiSigWalletAdressChangeds(
      first: 100
      orderBy: blockTimestamp
      orderDirection: desc
      subgraphError: allow
    ) {
      id
      blockTimestamp
      from
      newAddr
      oldAddr
      transactionHash
      blockNumber
    }
  }
`;

export const GET_MULTI_SIG_CHANGES_ID = (id: string) => gql`
  query GetMultiSigChangesId {
    multiSigWalletAdressChanged(
      id: "${id}"
    ) {
      newAddr
      oldAddr
      transactionHash
      from
      id
      blockTimestamp
      blockNumber
    }
  }
`;

export const GET_SUBSCRIPTION_BY_USDT_EVENTS = gql`
  query GetSubscriptionRequestEvents(
    $first: Int = 100
    $skip: Int = 0
    $orderBy: SubscriptionRequestEvent_orderBy = blockTimestamp # 替换为你的实际类型
    $orderDirection: OrderDirection = desc # 替换为你的实际类型
    $where: SubscriptionRequestEvent_filter = {} # 替换为你的实际类型
  ) {
    subscriptionRequestEvents(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
      subgraphError: allow
    ) {
      blockNumber
      blockTimestamp
      expiryTimestamp
      id
      patAmount
      subscriptionId
      transactionHash
      usdtAmount
      user
    }
  }
`;
