-- 1. 创建表 (改进版)
create table public.nft_metadata (
  id uuid primary key default gen_random_uuid(),
  token_id integer not null,
  wallet text not null,
  amount numeric not null,
  round integer not null,
  metadata jsonb default '{}', -- 新增：存储 NFT 元数据的 JSON 字段
  image_url text, -- 新增：NFT 图片 URL
  name text, -- 新增：NFT 名称
  description text, -- 新增：NFT 描述
  attributes jsonb default '[]', -- 新增：NFT 属性数组
  status text default 'active', -- 新增：NFT 状态 (active, burned, transferred 等)
  transaction_hash text, -- 新增：铸造交易哈希
  timestamp timestamp with time zone not null default now(),
  updated_at timestamp with time zone default now(), -- 新增：更新时间
  created_at timestamp with time zone default now()
);

-- 创建索引以提高查询性能
create index idx_nft_metadata_wallet on public.nft_metadata(wallet);
create index idx_nft_metadata_token_id on public.nft_metadata(token_id);
create index idx_nft_metadata_status on public.nft_metadata(status);

-- 2. 启用 Row-Level Security
alter table public.nft_metadata enable row level security;

-- 3. 创建 policy：仅允许用户读取自己的数据
create policy "Allow individual wallet read access"
on public.nft_metadata
for select
using (
  auth.jwt() ->> 'wallet' = lower(wallet)
);

-- 4. 创建 policy：仅允许用户插入属于自己的记录
create policy "Allow wallet insert"
on public.nft_metadata
for insert
with check (
  auth.jwt() ->> 'wallet' = lower(wallet)
);

-- 5. 创建 policy：仅允许用户更新自己的记录 (新增)
create policy "Allow wallet update"
on public.nft_metadata
for update
using (
  auth.jwt() ->> 'wallet' = lower(wallet)
);

-- 6. 创建触发器函数：自动更新 updated_at 字段 (新增)
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 7. 创建触发器：在更新时自动更新 updated_at 字段 (新增)
create trigger set_updated_at
before update on public.nft_metadata
for each row
execute function public.handle_updated_at();