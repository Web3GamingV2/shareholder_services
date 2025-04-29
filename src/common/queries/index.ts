/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-24 12:16:28
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-24 15:15:32
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
