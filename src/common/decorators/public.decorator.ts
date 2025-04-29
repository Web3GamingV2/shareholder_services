/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-21 22:13:19
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-04-21 22:13:26
 * @FilePath: /sbng_cake/shareholder_services/src/decorator/public.decorator.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * Decorator to mark a route as public (no JWT authentication required).
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
