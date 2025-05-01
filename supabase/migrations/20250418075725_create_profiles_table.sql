-- -- 确保 moddatetime 扩展已启用
-- CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- -- 首先创建自定义类型
-- CREATE TYPE public.wallet_type AS ENUM ('EOA', 'Safe', 'Centralized');

-- -- 创建 profiles 表
-- CREATE TABLE public.profiles (
--   -- 用户 ID，关联 auth.users 表的主键
--   id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

--   -- 用户主要的 EVM 兼容钱包地址 (例如 MetaMask)
--   primary_wallet_address TEXT NULL UNIQUE CHECK (primary_wallet_address ~ '^0x[a-fA-F0-9]{40}$'), -- 调整为允许 NULL，并保留格式校验

--   -- 钱包类型
--   wallet_type public.wallet_type DEFAULT 'EOA'::public.wallet_type NOT NULL,

--   -- 用户的 TRON 钱包地址 (用于接收赎回的 USDT)
--   tron_address TEXT NULL UNIQUE, -- 从第一版 schema 中添加

--   -- 用户昵称 (可选)
--   display_name TEXT NULL,

--   -- 用户邮箱 (可选, 可能来自 auth.users)
--   email TEXT NULL UNIQUE,

--   -- 是否启用了 OTP
--   is_otp_enabled BOOLEAN DEFAULT false NOT NULL,

--   -- 加密后的 OTP 密钥 (仅在 is_otp_enabled 为 true 时有值)
--   otp_secret TEXT NULL,

--   -- 上次登录时间
--   last_login_at TIMESTAMPTZ NULL,

--   -- 记录创建时间戳
--   created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

--   -- 记录最后更新时间戳
--   updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
-- );

-- -- 为 primary_wallet_address 创建索引以优化查询 (如果经常用它查询)
-- CREATE INDEX idx_profiles_primary_wallet_address ON public.profiles(primary_wallet_address);
-- -- 为 tron_address 创建索引 (如果需要)
-- -- CREATE INDEX idx_profiles_tron_address ON public.profiles(tron_address);
-- -- 为 email 创建索引 (如果需要)
-- -- CREATE INDEX idx_profiles_email ON public.profiles(email);


-- -- 启用行级安全 (RLS)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- -- 创建 RLS 策略: 用户只能查看自己的 profile
-- CREATE POLICY "Users can view their own profile."
--   ON public.profiles FOR SELECT
--   USING (auth.uid() = id);

-- -- 创建 RLS 策略: 用户只能更新自己的 profile
-- CREATE POLICY "Users can update their own profile."
--   ON public.profiles FOR UPDATE
--   USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);

-- -- 创建触发器，在更新 profile 时自动更新 updated_at 时间戳
-- CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
--   FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at); -- 使用 extensions schema 下的 moddatetime

-- -- 函数：在新用户注册时自动创建 profile 记录
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER
-- LANGUAGE plpgsql
-- SECURITY DEFINER SET search_path = public
-- AS $$
-- BEGIN
--   -- 插入新用户的 profile 记录，只包含 id，其他字段留待用户后续更新
--   -- 或者尝试从 new.raw_user_meta_data 获取初始值
--   INSERT INTO public.profiles (id, email, primary_wallet_address) -- 添加 email 和 primary_wallet_address
--   VALUES (
--     new.id,
--     new.email, -- 直接从 auth.users 获取 email
--     new.raw_user_meta_data->>'primary_wallet_address' -- 尝试从元数据获取钱包地址
--     -- 如果元数据中没有，primary_wallet_address 会是 NULL
--   );
--   RETURN new;
-- END;
-- $$;

-- -- 触发器：在 auth.users 表插入新记录后执行 handle_new_user 函数
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- -- 添加表和列的注释
-- COMMENT ON TABLE public.profiles IS '存储用户的扩展信息，关联 auth.users 表';
-- COMMENT ON COLUMN public.profiles.id IS '关联 auth.users.id';
-- COMMENT ON COLUMN public.profiles.primary_wallet_address IS '用户主要的 EVM 兼容钱包地址 (如 MetaMask)';
-- COMMENT ON COLUMN public.profiles.wallet_type IS '钱包类型 (EOA, Safe, Centralized)';
-- COMMENT ON COLUMN public.profiles.tron_address IS '用户的 TRON 钱包地址 (用于接收赎回)';
-- COMMENT ON COLUMN public.profiles.display_name IS '用户昵称';
-- COMMENT ON COLUMN public.profiles.email IS '用户的邮箱地址';
-- COMMENT ON COLUMN public.profiles.is_otp_enabled IS '是否启用了 OTP 双因素认证';
-- COMMENT ON COLUMN public.profiles.otp_secret IS '加密存储的 OTP 密钥';
-- COMMENT ON COLUMN public.profiles.last_login_at IS '用户最后登录时间';
-- COMMENT ON COLUMN public.profiles.created_at IS '记录创建时间 (UTC)';
-- COMMENT ON COLUMN public.profiles.updated_at IS '记录最后更新时间 (UTC)';