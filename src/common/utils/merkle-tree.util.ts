/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-19 22:45:47
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-19 22:58:54
 * @FilePath: /shareholder_services/src/common/utils/merkle-tree.util.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { keccak256 } from 'ethers';
import { MerkleTree } from 'merkletreejs';

export interface AirdropRecipient {
  address: string;
  amount: string; // 使用字符串表示大数
}
export class MerkleTreeUtil {
  private tree: MerkleTree;

  constructor(recipients: AirdropRecipient[]) {
    // 创建叶子节点
    const leaves = recipients.map((recipient) => {
      return Buffer.from(
        keccak256(
          Buffer.from(
            recipient.address.substr(2) +
              this.toHex(recipient.amount).substr(2),
            'hex',
          ),
        ).substr(2),
        'hex',
      );
    });

    // 创建Merkle树
    this.tree = new MerkleTree(leaves, keccak256, { sort: true });
  }

  // 获取Merkle根
  getRoot(): string {
    return '0x' + this.tree.getRoot().toString('hex');
  }

  public getProof(address: string, amount: string): string[] {
    const leaf = Buffer.from(
      keccak256(
        Buffer.from(address.substr(2) + this.toHex(amount).substr(2), 'hex'),
      ).substr(2),
      'hex',
    );
    return this.tree.getHexProof(leaf);
  }

  // 辅助函数：转换为16进制
  private toHex(value: string): string {
    // 将数值转换为16进制字符串
    let hex = BigInt(value).toString(16);
    // 确保偶数长度
    if (hex.length % 2 !== 0) {
      hex = '0' + hex;
    }
    return '0x' + hex;
  }
}
