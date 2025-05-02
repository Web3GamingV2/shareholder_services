/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-02 15:05:11
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-02 15:05:46
 * @FilePath: /shareholder_services/src/common/constants/env.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const nodeEnv = process.env.NODE_ENV;
const isDev = nodeEnv === 'development';
const isProd = nodeEnv === 'production';
export const env = {
  isDev,
  isProd,
  isTest: nodeEnv === 'test',
};
