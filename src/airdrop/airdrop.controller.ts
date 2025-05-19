/*
 * @Author: leelongxi leelongxi@foxmail.com
 * @Date: 2025-05-19 22:44:12
 * @LastEditors: leelongxi leelongxi@foxmail.com
 * @LastEditTime: 2025-05-20 00:19:17
 * @FilePath: /shareholder_services/src/airdrop/airdrop.controller.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  PlainLiteralObject,
  Req,
} from '@nestjs/common';
import { AirdropService } from './airdrop.service';
import { BaseController, BaseResponse } from 'src/common/base';
import { CreateAirdropDto } from 'src/common/dtos/airdrop/create-airdrop.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard';

@Controller('airdrop')
export class AirdropController extends BaseController {
  constructor(private readonly airdropService: AirdropService) {
    super();
  }

  // 创建空投（管理员接口）
  @UseGuards(JwtAuthGuard)
  @Post('airdrop')
  async createAirdrop(
    @Body() createAirdropDto: CreateAirdropDto,
    @Req() req: PlainLiteralObject,
  ): Promise<BaseResponse<PlainLiteralObject>> {
    try {
      const result = await this.airdropService.createAirdrop(
        req.user.supabaseClientId,
        createAirdropDto,
      );
      return this.success(result);
    } catch (err) {
      return this.error(err);
    }
  }

  // 获取领取证明
  @Get('claim/:airdropId/:address')
  async getClaimProof(
    @Param('airdropId') airdropId: string,
    @Param('address') address: string,
    @Req() req: PlainLiteralObject,
  ): Promise<BaseResponse<PlainLiteralObject>> {
    const result = await this.airdropService.claimAirdrop(
      req.user.supabaseClientId,
      airdropId,
      address,
    );
    return this.success(result);
  }

  // 标记为已领取
  @Post('claim/confirm')
  async confirmClaim(
    @Body() body: { airdropId: string; address: string; txHash: string },
    @Req() req: PlainLiteralObject,
  ): Promise<BaseResponse<PlainLiteralObject>> {
    const result = await this.airdropService.markAsClaimed(
      req.user.supabaseClientId,
      body.airdropId,
      body.address,
      body.txHash,
    );
    return this.success(result);
  }

  // 获取空投列表
  @Get('airdrops')
  async getAirdrops(@Req() req: PlainLiteralObject) {
    return this.airdropService.getAirdrops(req.user.supabaseClientId);
  }

  // 获取用户的空投列表
  @Get('airdrops/user/:address')
  async getUserAirdrops(
    @Param('address') address: string,
    @Req() req: PlainLiteralObject,
  ) {
    return this.airdropService.getUserAirdrops(
      req.user.supabaseClientId,
      address,
    );
  }
}
