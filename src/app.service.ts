/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-13 23:58:49
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-29 17:23:29
 * @FilePath: /shareholder_services/src/app.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    console.log('AppService constructor');
    console.log(this.config.get('PORT'));
  }

  getHello(): string {
    return 'Hello World!';
  }
}
