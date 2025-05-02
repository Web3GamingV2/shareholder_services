/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-02 12:40:10
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-02 12:40:29
 * @FilePath: /shareholder_services/src/pat_subscriptions/pat_subscriptions.interface.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface IPatSubscription {
  id: string;
  user_address: string;
  amount_usdt: number; // 或者使用 string/BigNumber 根据精度要求
  pat_amount: number; // 或者使用 string/BigNumber
  status:
    | 'pending'
    | 'waiting_payment'
    | 'paid'
    | 'expired'
    | 'failed'
    | 'cancelled';
  tier?: number;
  forward_tx_hash?: string;
  return_tx_hash?: string;
  admin_approved?: boolean;
  admin_approved_at?: string;
  extra_metadata?: any;
  created_at: string;
  expire_at: string;
  paid_at?: string;
  updated_at: string;
}
