/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-24 06:40:06
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-24 17:14:18
 * @FilePath: /sbng_cake/shareholder_services/src/safe_wallets/safe_wallets.interface.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface CreateTransaction {
  to: string;
  value: string;
}
