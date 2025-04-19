-- 1. 创建 roles 表来定义角色
CREATE TABLE public.roles (
  id TEXT PRIMARY KEY, -- 角色的唯一标识符，例如 'admin', 'member'
  description TEXT     -- 对角色的可选描述
);

-- 为表和列添加注释（可选）
COMMENT ON TABLE public.roles IS '定义应用程序中可用的用户角色。';
COMMENT ON COLUMN public.roles.id IS '角色的唯一标识符 (例如, ''admin'')。';
COMMENT ON COLUMN public.roles.description IS '对角色用途的简要描述。';


-- 2. 创建 user_roles 表来关联用户和角色 (多对多关系)
CREATE TABLE public.user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- 外键，关联到 Supabase Auth 中的用户。用户删除时级联删除关联。
  role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT, -- 外键，关联到上面定义的角色。RESTRICT 防止在有用户分配了该角色时删除角色。
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL, -- 角色分配给用户的时间戳

  PRIMARY KEY (user_id, role_id) -- 复合主键，防止给同一用户重复分配同一角色
);

-- 为表和列添加注释（可选）
COMMENT ON TABLE public.user_roles IS '将角色分配给用户。';
COMMENT ON COLUMN public.user_roles.user_id IS '外键，引用 auth.users 中的用户。';
COMMENT ON COLUMN public.user_roles.role_id IS '外键，引用 public.roles 中的角色。';
COMMENT ON COLUMN public.user_roles.created_at IS '角色分配给用户的时间戳。';

-- 添加索引以提高查询性能（可选但推荐）
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);

-- 3. 创建 invites 表来存储邀请码
CREATE TABLE public.invites (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  code text NOT NULL UNIQUE,
  is_used boolean DEFAULT false NOT NULL,
  used_by_address text NULL,
  used_at timestamp with time zone NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone NULL,
  created_by_user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL -- 可选：关联创建者
);

-- 为表和列添加注释（可选）
COMMENT ON TABLE public.invites IS '存储用户注册邀请码。';
COMMENT ON COLUMN public.invites.code IS '唯一的邀请码字符串。';
COMMENT ON COLUMN public.invites.is_used IS '邀请码是否已被使用。';
COMMENT ON COLUMN public.invites.used_by_address IS '使用此邀请码注册的用户的以太坊地址。';
COMMENT ON COLUMN public.invites.used_at IS '邀请码被使用的时间戳。';
COMMENT ON COLUMN public.invites.created_by_user_id IS '创建此邀请码的管理员用户 ID (如果适用)。';

-- 添加索引以提高查询性能
CREATE INDEX idx_invites_code ON public.invites USING btree (code);
CREATE INDEX idx_invites_created_by ON public.invites(created_by_user_id); -- 如果需要按创建者查询


-- 4. 启用行级安全策略 (RLS) - 重要！
-- 启用 RLS 但不定义任何策略，意味着只有 Service Role Key 可以访问这些表。
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- RLS 策略已被移除，所有权限检查由后端负责。

-- 5. 插入初始角色数据 (可选)
-- 初始数据插入已被移除，应由后端服务或种子脚本处理。
-- INSERT INTO public.roles (id, description) VALUES
--  ('admin', '拥有完全访问权限的管理员'),
--  ('member', '拥有基本访问权限的标准成员');


-- 注意:
-- 1. RLS 已启用，但没有定义允许访问的策略。
-- 2. 所有对这些表的操作都必须通过后端服务进行，后端服务使用 Service Role Key。
-- 3. 后端服务必须严格执行权限检查逻辑。