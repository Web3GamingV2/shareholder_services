import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsPositive,
  Matches,
  Min,
} from 'class-validator';

export class CreateSubscriptionDto {
  /**
   * 用户选择的申购层级。
   * 必须为正整数。
   * @example 1
   */
  @IsNotEmpty({ message: '申购层级不能为空。' })
  @IsInt({ message: '申购层级必须是整数。' })
  @IsPositive({ message: '申购层级必须是正数。' })
  @Min(1, { message: '申购层级必须大于等于 1。' })
  tier: number;

  // 可以根据需要添加其他字段，例如：
  // 如果 USDT 金额由前端指定而不是根据 tier 推断:
  @IsNotEmpty({ message: 'USDT 金额不能为空。' })
  @IsNumberString({}, { message: 'USDT 金额必须是数字字符串。' }) // 使用 IsNumberString 处理大数或精度
  @Matches(/^\d+(\.\d{1,6})?$/, {
    message: 'USDT 金额格式无效或精度过高 (最多6位小数)。',
  }) // 示例：最多6位小数
  amount_usdt: string;
}
