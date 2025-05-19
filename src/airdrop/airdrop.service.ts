/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-19 22:44:05
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-20 00:09:41
 * @FilePath: /shareholder_services/src/airdrop/airdrop.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PlainLiteralObject,
} from '@nestjs/common';
// import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { CreateAirdropDto } from 'src/common/dtos/airdrop/create-airdrop.dto';
import { MerkleTreeUtil } from 'src/common/utils/merkle-tree.util';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AirdropService {
  constructor(private readonly supabase: SupabaseService) {}

  async createAirdrop(
    supabaseClientId: string,
    createAirdropDto: CreateAirdropDto,
  ): Promise<PlainLiteralObject> {
    const {
      name,
      description,
      tokenAddress,
      startDate,
      endDate,
      isActive,
      recipients,
    } = createAirdropDto;
    // 生成Merkle树
    const merkleTreeUtil = new MerkleTreeUtil(recipients);
    const merkleRoot = merkleTreeUtil.getRoot();
    // 创建空投记录
    const airdropId = uuidv4();
    const airdrop = {
      id: airdropId,
      name,
      description,
      tokenAddress,
      merkleRoot,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const supabase = await this.supabase.getSupabaseClient(supabaseClientId);

    // 保存到Supabase
    const { error: airdropError } = await supabase
      .from('airdrops')
      .insert(airdrop);

    if (airdropError) {
      throw new BadRequestException('Failed to create airdrop');
    }

    // 保存接收者信息
    const airdropRecipients = recipients.map((recipient) => ({
      id: uuidv4(),
      airdropId,
      address: recipient.address,
      amount: recipient.amount,
      hasClaimed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const { data: recipientsData, error: recipientsError } = await supabase
      .from('airdrop_recipients')
      .insert(airdropRecipients);

    if (recipientsError) {
      throw new BadRequestException('Failed to save airdrop recipients');
    }

    return { airdrop, merkleRoot, recipientsData };
  }

  async claimAirdrop(
    supabaseClientId: string,
    airdropId: string,
    address: string,
  ) {
    const supabase = await this.supabase.getSupabaseClient(supabaseClientId);
    // 验证空投是否存在且有效
    const { data: airdrop, error: airdropError } = await supabase
      .from('airdrops')
      .select('*')
      .eq('id', airdropId)
      .eq('isActive', true)
      .single();

    if (airdropError || !airdrop) {
      throw new NotFoundException('Airdrop not found or not active');
    }

    // 验证当前时间是否在空投期间
    const now = new Date();
    if (now < new Date(airdrop.startDate) || now > new Date(airdrop.endDate)) {
      throw new BadRequestException('Airdrop is not active at this time');
    }

    // 获取接收者信息
    const { data: recipient, error: recipientError } = await supabase
      .from('airdrop_recipients')
      .select('*')
      .eq('airdropId', airdropId)
      .eq('address', address.toLowerCase())
      .single();

    if (recipientError || !recipient) {
      throw new NotFoundException('You are not eligible for this airdrop');
    }

    // 检查是否已领取
    if (recipient.hasClaimed) {
      throw new BadRequestException('You have already claimed this airdrop');
    }

    // 获取所有接收者信息以重建Merkle树
    const { data: allRecipients, error: allRecipientsError } = await supabase
      .from('airdrop_recipients')
      .select('address, amount')
      .eq('airdropId', airdropId);

    if (allRecipientsError) {
      throw new BadRequestException('Failed to get airdrop recipients');
    }

    // 重建Merkle树
    const merkleTreeUtil = new MerkleTreeUtil(allRecipients);

    // 获取Merkle证明
    const proof = merkleTreeUtil.getProof(address, recipient.amount);

    // 生成签名（可选，用于额外验证）
    // const wallet = new ethers.Wallet(this.configService.privateKey);
    // const message = `${address}:${airdropId}:${recipient.amount}`;
    // const signature = await wallet.signMessage(message);

    return {
      airdropId,
      address,
      amount: recipient.amount,
      merkleRoot: airdrop.merkleRoot,
      merkleProof: proof,
      //   signature,
      //   contractAddress: this.configService.contractAddress,
    };
  }

  // 标记为已领取（在用户成功调用合约后）
  async markAsClaimed(
    supabaseClientId: string,
    airdropId: string,
    address: string,
    txHash: string,
  ): Promise<PlainLiteralObject> {
    const supabase = await this.supabase.getSupabaseClient(supabaseClientId);
    const { data, error } = await supabase
      .from('airdrop_recipients')
      .update({
        hasClaimed: true,
        claimedAt: new Date(),
        transactionHash: txHash,
        updatedAt: new Date(),
      })
      .eq('airdropId', airdropId)
      .eq('address', address.toLowerCase());

    if (error) {
      throw new BadRequestException('Failed to mark as claimed');
    }

    return { success: true, data };
  }

  // 获取空投列表
  async getAirdrops(supabaseClientId: string) {
    const supabase = await this.supabase.getSupabaseClient(supabaseClientId);
    const { data, error } = await supabase
      .from('airdrops')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      throw new BadRequestException('Failed to get airdrops');
    }

    return data;
  }

  // 获取用户的空投列表
  async getUserAirdrops(supabaseClientId: string, address: string) {
    const supabase = await this.supabase.getSupabaseClient(supabaseClientId);
    const { data, error } = await supabase
      .from('airdrop_recipients')
      .select(
        `
        *,
        airdrops:airdropId(*)
      `,
      )
      .eq('address', address.toLowerCase());

    if (error) {
      throw new BadRequestException('Failed to get user airdrops');
    }

    return data;
  }
}
