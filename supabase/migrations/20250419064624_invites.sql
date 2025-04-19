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
-- 可能需要索引
CREATE INDEX idx_invites_code ON public.invites USING btree (code);