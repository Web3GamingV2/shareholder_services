/* eslint-disable @typescript-eslint/ban-ts-comment */
/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 22:38:14
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-07 07:27:49
 * @FilePath: /sbng_cake/shareholder_services/src/the-graph/the-graph.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  GraphQlResponse,
  MultiSigWalletAdressChanged,
  GraphQLClient,
  SubscriptionRequestEvent,
  SubscriptionRequestVariables,
  MintProofEvent,
} from './the-graph.interface';
import { InjectGraphQLClient } from '@golevelup/nestjs-graphql-request';
import {
  GET_MULTI_SIG_CHANGES,
  GET_MULTI_SIG_CHANGES_ID,
  GET_SUBSCRIPTION_BY_USDT_EVENTS,
} from 'src/common/queries';

@Injectable()
export class TheGraphService implements OnModuleInit {
  private readonly logger = new Logger(TheGraphService.name);

  constructor(@InjectGraphQLClient() private readonly client: GraphQLClient) {}

  onModuleInit() {
    this.logger.log('TheGraphService initialized.');
  }

  async getMultiSigChanges(): Promise<MultiSigWalletAdressChanged[]> {
    try {
      // <<< 使用 client.request 发送请求，传入 gql 定义的查询 >>>
      const response = await this.client.request<
        GraphQlResponse<MultiSigWalletAdressChanged[]>
      >(GET_MULTI_SIG_CHANGES);

      const resultData = response.multiSigWalletAdressChangeds;

      if (!resultData) {
        this.logger.warn(
          'No multiSigWalletAdressChangeds data returned from subgraph.',
        );
        return [];
      }

      this.logger.log(`Successfully fetched ${resultData.length} records.`);
      return resultData;
    } catch (error) {
      this.logger.error(
        `Error fetching data from subgraph: ${error.message}`,
        error.stack,
      );
      if (error.response && error.response.errors) {
        this.logger.error(
          'GraphQL Errors:',
          JSON.stringify(error.response.errors),
        );
      }
      throw new Error('Failed to fetch data from The Graph subgraph.');
    }
  }

  async getMultiSigChangesById(
    id: string,
  ): Promise<MultiSigWalletAdressChanged> {
    try {
      const queryForId = GET_MULTI_SIG_CHANGES_ID(id);
      const response =
        await this.client.request<GraphQlResponse<MultiSigWalletAdressChanged>>(
          queryForId,
        );
      const resultData = response.multiSigWalletAdressChanged;
      if (!resultData) {
        this.logger.warn(
          'No multiSigWalletAdressChanged data returned from subgraph.',
        );
        return null;
      }
      this.logger.log(`Successfully fetched record for id: ${id}.`);
      return resultData;
    } catch (error) {
      this.logger.error(
        `Error fetching data from subgraph: ${error.message}`,
        error.stack,
      );
      if (error.response && error.response.errors) {
        this.logger.error(
          'GraphQL Errors:',
          JSON.stringify(error.response.errors),
        );
      }
      throw new Error('Failed to fetch data from The Graph subgraph.');
    }
  }

  // 新增方法获取 SubscriptionRequestEvent
  async getSubscriptionByUsdtGql(
    variables?: SubscriptionRequestVariables,
  ): Promise<SubscriptionRequestEvent[]> {
    try {
      const response = await this.client.request<
        GraphQlResponse<SubscriptionRequestEvent[]> // 使用新的接口和正确的泛型
      >(GET_SUBSCRIPTION_BY_USDT_EVENTS, variables); // 使用新的查询

      const resultData = response.subscriptionRequestEvents; // 访问正确的字段

      if (!resultData) {
        this.logger.warn(
          'No subscriptionRequestEvents data returned from subgraph.',
        );
        return [];
      }

      this.logger.log(
        `Successfully fetched ${resultData.length} subscription request events.`,
      );
      return resultData;
    } catch (error) {
      this.logger.error(
        `Error fetching subscription request events from subgraph: ${error.message}`,
        error.stack,
      );
      if (error.response && error.response.errors) {
        this.logger.error(
          'GraphQL Errors:',
          JSON.stringify(error.response.errors),
        );
      }
      throw new Error(
        'Failed to fetch subscription request events from The Graph subgraph.',
      );
    }
  }

  async getMintProofEvents(
    variables?: SubscriptionRequestVariables,
  ): Promise<MintProofEvent[]> {
    console.log('getMintProofEvents', variables);
    return [];
  }
}
