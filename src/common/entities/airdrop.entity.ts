/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-19 22:45:37
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-19 23:00:20
 * @FilePath: /shareholder_services/src/common/entities/airdrop.entity.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export class Airdrop {
  id: string;
  name: string;
  description: string;
  tokenAddress: string;
  merkleRoot: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AirdropRecipient {
  id: string;
  airdropId: string;
  address: string;
  amount: string;
  hasClaimed: boolean;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
