-- 确保 moddatetime 扩展已启用
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- 首先创建自定义类型
CREATE TYPE public.wallet_type AS ENUM ('EOA', 'Safe', 'Centralized Custody');

-- 创建 profiles 表
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE, -- 直接关联 Supabase auth 用户 ID
  wallet_address text NOT NULL UNIQUE, -- 用户的主要钱包地址 (EOA, Safe, 或托管标识符)
  wallet_type public.wallet_type DEFAULT 'EOA'::public.wallet_type NOT NULL, -- ENUM 类型: 'EOA', 'Safe', 'Centralized Custody'
  display_name text NULL, -- 用户昵称 (可选)
  email text NULL UNIQUE, -- 用户邮箱 (可选, 可能来自 auth.users)
  is_otp_enabled boolean DEFAULT false NOT NULL, -- 是否启用了 OTP
  otp_secret text NULL, -- 加密后的 OTP 密钥 (仅在 is_otp_enabled 为 true 时有值)
  last_login_at timestamptz NULL, -- 上次登录时间
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 为 wallet_address 创建索引以优化查询
CREATE INDEX idx_profiles_wallet_address ON public.profiles(wallet_address);

-- 启用行级安全 (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略: 用户只能查看自己的 profile
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 创建 RLS 策略: 用户只能更新自己的 profile
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 确保 moddatetime 扩展已启用 (通常 Supabase 项目默认启用)
-- 如果执行迁移时报错说 moddatetime 不存在，你可能需要在 Supabase SQL 编辑器中运行:
-- CREATE EXTENSION IF NOT EXISTS moddatetime;

-- 创建触发器，在更新 profile 时自动更新 updated_at 时间戳
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- 可选: 如果你想在 auth.users 创建新用户时自动创建 profile 记录，
-- 你需要先创建一个函数，然后创建一个触发器。
-- 注意: 这个示例假设 wallet_address 可以从用户的元数据中获取，
-- 或者你需要在用户注册流程的其他地方处理 profile 的创建。
-- 1. 创建函数
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- 尝试从 auth.users 的 raw_user_meta_data 插入，你需要确保注册时提供了 wallet_address
  -- 如果 wallet_address 不是必须立即提供的，可以只插入 id，后续再更新
  insert into public.profiles (id, wallet_address)
  values (new.id, coalesce(new.raw_user_meta_data->>'wallet_address', 'default_or_placeholder_address')); -- 提供一个默认值或占位符
  return new;
end;
$$;

-- 2. 创建触发器
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();