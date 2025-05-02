/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-04-22 14:59:07
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-02 12:04:03
 * @FilePath: /shareholder_services/src/sign/sign.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BaseController, BaseResponse } from 'src/common/base';
import { SignService } from './sign.service';
import { GetNonceDto, VerifySiweDto } from 'src/common/dtos/sign.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('sign')
export class SignController extends BaseController {
  constructor(private readonly signService: SignService) {
    // 注入 SignService
    super(); // 调用父类构造函数
  }

  /**
   * 获取用于 SIWE 签名的 Nonce。
   * @param query 包含钱包地址的查询参数 DTO
   * @returns 返回包含 Nonce 的响应对象
   */
  @Get('nonce')
  @Public()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // 应用验证管道
  async getNonce(
    @Query() query: GetNonceDto, // 使用 DTO 接收和验证查询参数
  ): Promise<BaseResponse<{ nonce: string }>> {
    try {
      const { address } = query;
      // 调用 Service 层的方法，该方法现在直接返回 { nonce: string } 或抛出错误
      const result = await this.signService.getNonce(address);
      // 使用 BaseController 的 success 方法包装成功响应
      return this.success(result);
    } catch (error) {
      // 捕获 Service 层抛出的错误
      console.error(
        `Error in getNonce controller for address ${query.address}:`,
        error,
      );
      // 可以根据 error 类型判断返回不同的 HttpException
      // 这里统一返回 500 错误，或者可以根据 error.message 等判断
      throw new HttpException(
        '获取 Nonce 时发生内部错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 验证 SIWE 签名。
   * @param body 包含 SIWE message 和 signature 的请求体 DTO
   * @returns 返回验证结果
   */
  @Post('verify') // 定义 POST 路由
  @Public()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // 应用验证管道
  async verifySiweSignature(
    @Body() body: VerifySiweDto, // 使用 DTO 接收和验证请求体
  ): Promise<BaseResponse<{ verified: boolean; address?: string }>> {
    try {
      console.log('Received request to verify SIWE signature:', body);
      const { message, signature } = body;
      const result = await this.signService.verifySiweSignature(
        message,
        signature,
      );
      return this.success(result);
    } catch (error) {
      // 捕获 Service 层抛出的 HttpException 或其他错误
      console.error('Error in verifySiweSignature controller:', error);
      // 如果错误已经是 HttpException 的实例，直接重新抛出
      if (error instanceof HttpException) {
        throw error;
      }
      // 对于其他意外错误，抛出标准的内部服务器错误
      throw new HttpException(
        '签名验证过程中发生未知错误。',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
