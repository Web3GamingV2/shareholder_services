/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-29 19:30:31
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 19:30:51
 * @FilePath: /shareholder_services/src/auth/auth.interface.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface AuthInterface {
  accessToken: string;
  refreshToken?: string;
  needsMfa?: boolean;
  userId?: string;
  factorId?: string;
}
