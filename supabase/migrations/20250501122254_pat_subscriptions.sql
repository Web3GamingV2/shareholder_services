-- 确保 pgcrypto 扩展已启用 (用于 gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 确保 moddatetime 扩展已启用 (用于自动更新 updated_at)
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- 创建 pat_subscriptions 表
CREATE TABLE public.pat_subscriptions (
  id uuid PRIMARY KEY DEFAULT extensions.gen_random_uuid(),

  user_address text NOT NULL,
  amount_usdt numeric NOT NULL CHECK (amount_usdt > 0),
  pat_amount numeric NOT NULL, -- 考虑添加 CHECK (pat_amount > 0)

  status text NOT NULL CHECK (
    status IN ('pending', 'waiting_payment', 'paid', 'expired', 'failed', 'cancelled')
  ),

  tier int, -- 考虑添加 CHECK (tier > 0)
  forward_tx_hash text, -- 考虑添加 UNIQUE 约束
  return_tx_hash text, -- 考虑添加 UNIQUE 约束

  admin_approved boolean DEFAULT false,
  admin_approved_at timestamptz,

  extra_metadata jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  -- expire_at 不再是生成列，将由触发器设置
  expire_at timestamptz NOT NULL,

  paid_at timestamptz,
  -- updated_at 默认在插入时设置，并通过触发器在更新时更新
  updated_at timestamptz DEFAULT now()
);

-- 为 user_address 和活动状态创建部分索引
CREATE INDEX idx_user_active_subscription ON public.pat_subscriptions (user_address)
WHERE status IN ('pending', 'waiting_payment');

-- 创建 trigger function 用于在插入时设置 expire_at
CREATE OR REPLACE FUNCTION set_expire_at()
RETURNS TRIGGER AS $$
BEGIN
  -- 使用 NEW.created_at (因为 default now() 已经执行)
  NEW.expire_at := NEW.created_at + interval '1 hour';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 绑定 trigger 到表，在插入前执行
CREATE TRIGGER trg_set_expire_at
BEFORE INSERT ON public.pat_subscriptions
FOR EACH ROW
EXECUTE FUNCTION set_expire_at();

-- 创建触发器以在更新行时自动更新 updated_at 字段
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.pat_subscriptions
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

ALTER TABLE public.pat_subscriptions ENABLE ROW LEVEL SECURITY;

-- 可选：添加注释说明各字段用途
COMMENT ON TABLE public.pat_subscriptions IS '存储用户 PAT 认购信息';
COMMENT ON COLUMN public.pat_subscriptions.user_address IS '发起认购的用户钱包地址';
COMMENT ON COLUMN public.pat_subscriptions.amount_usdt IS '用户支付的 USDT 金额';
COMMENT ON COLUMN public.pat_subscriptions.pat_amount IS '用户应获得的 PAT 数量';
COMMENT ON COLUMN public.pat_subscriptions.status IS '认购状态';
COMMENT ON COLUMN public.pat_subscriptions.tier IS '认购层级 (如果适用)';
COMMENT ON COLUMN public.pat_subscriptions.forward_tx_hash IS '用户支付 USDT 的交易哈希';
COMMENT ON COLUMN public.pat_subscriptions.return_tx_hash IS '系统返还 PAT 的交易哈希';
COMMENT ON COLUMN public.pat_subscriptions.admin_approved IS '管理员是否已批准此认购';
COMMENT ON COLUMN public.pat_subscriptions.admin_approved_at IS '管理员批准时间';
COMMENT ON COLUMN public.pat_subscriptions.extra_metadata IS '存储额外信息的 JSONB 字段';
COMMENT ON COLUMN public.pat_subscriptions.created_at IS '记录创建时间';
COMMENT ON COLUMN public.pat_subscriptions.expire_at IS '记录过期时间 (由触发器设置)';
COMMENT ON COLUMN public.pat_subscriptions.paid_at IS '用户完成支付的时间';
COMMENT ON COLUMN public.pat_subscriptions.updated_at IS '记录最后更新时间';
