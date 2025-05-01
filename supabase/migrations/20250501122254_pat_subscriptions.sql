create table pat_subscriptions (
  id uuid primary key default gen_random_uuid(),

  user_address text not null,
  amount_usdt numeric not null check (amount_usdt > 0),
  pat_amount numeric not null,

  status text not null check (
    status in ('pending', 'waiting_payment', 'paid', 'expired', 'failed', 'cancelled')
  ),

  tier int,
  forward_tx_hash text,
  return_tx_hash text,

  admin_approved boolean default false,
  admin_approved_at timestamptz,

  extra_metadata jsonb,

  created_at timestamptz not null default now(),
  expire_at timestamptz generated always as (created_at + interval '1 hour') stored,

  paid_at timestamptz,
  updated_at timestamptz default now()
);

create index idx_user_active_subscription on pat_subscriptions (user_address)
where status in ('pending', 'waiting_payment');
