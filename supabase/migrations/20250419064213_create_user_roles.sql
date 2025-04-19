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


-- 3. 启用行级安全策略 (RLS) - 重要！
-- 你需要根据你的应用逻辑定义具体的 RLS 策略。
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS 策略示例 (你需要根据实际需求调整或创建更复杂的策略):

-- 允许所有已认证用户读取角色列表
-- CREATE POLICY "Allow authenticated read access to roles"
-- ON public.roles FOR SELECT
-- USING ( auth.role() = 'authenticated' );

-- 允许用户查看自己的角色分配
-- CREATE POLICY "Allow users to view their own roles"
-- ON public.user_roles FOR SELECT
-- USING ( auth.uid() = user_id );

-- 允许管理员管理所有用户角色 (需要一个检查管理员身份的函数，例如 is_admin())
-- CREATE POLICY "Allow admins to manage all user roles"
-- ON public.user_roles FOR ALL
-- USING ( is_admin(auth.uid()) ) -- 假设 is_admin() 函数存在
-- WITH CHECK ( is_admin(auth.uid()) );


-- 4. 插入初始角色数据 (可选)
INSERT INTO public.roles (id, description) VALUES
  ('admin', '拥有完全访问权限的管理员'),
  ('member', '拥有基本访问权限的标准成员');
  -- 根据需要添加其他角色


-- 注意: 你需要创建 RLS 策略来控制谁可以读取和修改这些表。
-- 你可能还需要创建一个 SQL 函数 (例如 is_admin(user_id UUID)) 来检查用户是否具有特定角色，
-- 以便在 RLS 策略或后端代码中使用。