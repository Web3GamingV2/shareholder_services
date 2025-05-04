/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-02 12:25:56
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-04 05:20:29
 * @FilePath: /shareholder_services/src/pat_subscriptions/pat_subscriptions.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ContractsCallerService } from 'src/contracts_caller/contracts_caller.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { IPatSubscription } from './pat_subscriptions.interface';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import { CreateSubscriptionDto } from 'src/common/dtos/pat_subscriptions.dto';
import { RedisService } from 'src/redis/redis.service';
import { createVerificationId } from 'src/common/utils';

@Injectable()
export class PatSubscriptionsService {
  get contractsCaller() {
    return this.contractsCallerService;
  }

  constructor(
    private readonly contractsCallerService: ContractsCallerService,
    private readonly supabaseService: SupabaseService,
    private readonly redisService: RedisService,
  ) {
    console.log('PatSubscriptionsService');
  }

  /**
   * 创建一个新的 PAT 申购记录
   * @param userId - 从 JWT 验证后获得的用户 ID (如果需要关联 Supabase auth user)
   * @param userAddress - 发起申购的用户钱包地址 (需要验证是否与 JWT 匹配，或直接信任 JWT 中的地址信息)
   * @param dto - 包含申购所需其他信息的 DTO (例如 tier, amount 等，取决于你的业务逻辑)
   */
  async createSubscription(
    supabaseClientId: string,
    userId: string, // 来自经过验证的 JWT
    userAddress: string, // 确保这个地址是授权用户想要操作的地址
    dto: CreateSubscriptionDto, // 假设的 DTO
  ): Promise<IPatSubscription> {
    const verificationId = createVerificationId(userAddress);

    // 检查 Redis 中是否存在 verificationId
    const verificationCode = await this.redisService.get(verificationId);
    if (!verificationCode) {
      throw new BadRequestException('无效的验证 ID。');
    }

    console.log(
      `[createSubscription] userId: ${userId}, userAddress: ${userAddress}, dto: ${JSON.stringify(
        dto,
      )}`,
    );
    const supabase =
      await this.supabaseService.getSupabaseClient(supabaseClientId);

    if (!supabaseClientId) {
      throw new InternalServerErrorException('未提供 Supabase 客户端 ID。');
    }

    // 1. 检查用户是否已有进行中的申购 (状态为 'pending' 或 'waiting_payment')
    const { data: existingSubscriptions, error: checkError } = await supabase
      .from('pat_subscriptions')
      .select('id, status')
      .eq('user_address', userAddress.toLowerCase())
      .in('status', ['pending', 'waiting_payment']);

    if (checkError) {
      console.error('检查现有申购时出错:', checkError);
      throw new InternalServerErrorException('无法检查现有申购记录。');
    }

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      throw new ConflictException(
        '你已有一个正在进行中的申购，请先完成或取消。',
      );
    }

    // --- 与智能合约交互 (占位符) ---
    let forwardTxHash: string | undefined;
    try {
      // TODO: 在这里实现与智能合约的交互逻辑
      // 1. 确定申购的 tier, amount_usdt, pat_amount (可能来自 dto 或配置)
      // 2. 调用智能合约的申购函数，传入 userAddress 和其他必要参数
      // const txResponse = await this.blockchainService.initiateSubscription(userAddress, dto.tier, dto.amount);
      // forwardTxHash = txResponse.hash; // 获取交易哈希
      console.log(
        `[Placeholder] 调用智能合约为地址 ${userAddress} 发起申购...`,
      );
      // 假设合约调用成功并返回了交易哈希
      forwardTxHash = `0x_placeholder_tx_hash_${Date.now()}`; // 示例哈希
    } catch (contractError) {
      console.error('调用智能合约时出错:', contractError);
      // 根据错误类型决定如何响应，可能是 BadRequest 或 InternalServerError
      throw new InternalServerErrorException('与智能合约交互失败。');
    }
    // --- 合约交互结束 ---

    // 3. 准备插入数据库的数据
    // TODO: 确定实际的 amount_usdt 和 pat_amount，可能基于 tier 或 dto
    const amountUsdt = 100; // 示例值
    const patAmount = 1000; // 示例值
    const initialStatus = 'waiting_payment'; // 或 'pending'，取决于你的流程
    const tier = 1; // 示例值

    const newSubscriptionData = {
      user_address: userAddress.toLowerCase(),
      amount_usdt: amountUsdt,
      pat_amount: patAmount,
      status: initialStatus,
      tier: tier,
      forward_tx_hash: forwardTxHash, // 存储合约交易哈希
    };

    // 4. 将申购记录插入数据库
    const {
      data: newSubscription,
      error: insertError,
    }: PostgrestSingleResponse<IPatSubscription> = await supabase
      .from('pat_subscriptions')
      .insert(newSubscriptionData)
      .select() // 返回插入的记录
      .single(); // 期望只插入一条

    if (insertError) {
      console.error('创建申购记录时出错:', insertError);
      // 可以根据 insertError.code 判断是否是唯一约束冲突等特定错误
      throw new InternalServerErrorException('无法创建申购记录。');
    }

    if (!newSubscription) {
      throw new InternalServerErrorException('创建申购记录后未能取回数据。');
    }

    console.log(
      `为地址 ${userAddress} 创建申购记录成功，ID: ${newSubscription.id}`,
    );

    // 5. 返回新创建的申购记录给 Controller/前端
    return newSubscription;
  }

  /**
   * 获取用户的申购记录 (示例)
   */
  async getSubscriptionsByUser(
    supabaseClientId: string,
    userAddress: string,
  ): Promise<IPatSubscription[]> {
    const supabase =
      await this.supabaseService.getSupabaseClient(supabaseClientId);
    const { data, error } = await supabase
      .from('pat_subscriptions')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取用户申购记录时出错:', error);
      throw new InternalServerErrorException('无法获取申购记录。');
    }
    return data || [];
  }

  /**
   * 取消申购 (需要实现合约交互和数据库更新)
   * @param subscriptionId 要取消的申购记录 ID
   * @param userId 发起取消操作的用户 ID (用于权限验证)
   */
  async cancelSubscription(
    supabaseClientId: string,
    subscriptionId: string,
    userId: string,
    userAddress: string,
  ): Promise<IPatSubscription> {
    const supabase =
      await this.supabaseService.getSupabaseClient(supabaseClientId);

    // 1. 查找申购记录并验证所有权和状态
    const { data: subscription, error: findError } = await supabase
      .from('pat_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_address', userAddress.toLowerCase()) // 确保是用户自己的记录
      .maybeSingle(); // 可能找不到

    if (findError) {
      console.error('查找待取消申购记录时出错:', findError);
      throw new InternalServerErrorException('查找申购记录失败。');
    }

    if (!subscription) {
      throw new NotFoundException('未找到指定的申购记录或无权操作。');
    }

    // 检查状态是否允许取消 (例如，只能取消 pending 或 waiting_payment 或 expired?)
    if (
      !['pending', 'waiting_payment', 'expired'].includes(subscription.status)
    ) {
      throw new BadRequestException(
        `当前状态 (${subscription.status}) 不允许取消。`,
      );
    }

    // --- 与智能合约交互支付取消费用 (占位符) ---
    try {
      // TODO: 调用合约的取消/支付费用功能
      // const cancelTx = await this.blockchainService.cancelSubscriptionAndPayFee(subscriptionId, userAddress);
      console.log(
        `[Placeholder] 调用智能合约为申购 ${subscriptionId} 处理取消和手续费...`,
      );
      // 可能需要存储取消费用的交易哈希
    } catch (contractError) {
      console.error('调用合约取消功能时出错:', contractError);
      throw new InternalServerErrorException('与智能合约交互取消失败。');
    }
    // --- 合约交互结束 ---

    // 3. 更新数据库状态为 'cancelled'
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('pat_subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscriptionId)
      .select()
      .single();

    if (updateError) {
      console.error('更新申购状态为 cancelled 时出错:', updateError);
      throw new InternalServerErrorException('更新申购状态失败。');
    }

    if (!updatedSubscription) {
      throw new InternalServerErrorException('更新申购状态后未能取回数据。');
    }

    console.log(`申购记录 ${subscriptionId} 已成功取消。`);
    return updatedSubscription;
  }
}
