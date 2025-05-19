-- 空投表
CREATE TABLE airdrops (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  token_address TEXT NOT NULL,
  merkle_root TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 空投接收者表
CREATE TABLE airdrop_recipients (
  id UUID PRIMARY KEY,
  airdrop_id UUID REFERENCES airdrops(id),
  address TEXT NOT NULL,
  amount TEXT NOT NULL,
  has_claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 社交账号绑定表（防女巫攻击）
CREATE TABLE social_bindings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  address TEXT NOT NULL,
  social_type TEXT NOT NULL, -- 'twitter', 'github', etc.
  social_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(social_type, social_id)
);

-- 用户设备记录表（防女巫攻击）
CREATE TABLE user_devices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  address TEXT NOT NULL,
  device_info JSONB NOT NULL,
  ip_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_airdrop_recipients_address ON airdrop_recipients(address);
CREATE INDEX idx_social_bindings_address ON social_bindings(address);
CREATE INDEX idx_user_devices_address ON user_devices(address);
CREATE INDEX idx_user_devices_ip_address ON user_devices(ip_address);