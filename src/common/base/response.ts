/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-29 21:48:55
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 21:49:05
 * @FilePath: /shareholder_services/src/common/base/response.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

export class SuccessResult<T> {
  data: T;
  message: string;
  errno: number;

  constructor(data: T, message = 'success', errno: number = 0) {
    this.data = data;
    this.message = message;
    this.errno = errno;
  }
}

export class ErrorResult {
  data: null;
  message: string;
  errno: number;

  constructor(message: string | Error, errno: number = 1) {
    this.data = null;
    this.message = message instanceof Error ? message.message : message;
    this.errno = errno;
  }
}
