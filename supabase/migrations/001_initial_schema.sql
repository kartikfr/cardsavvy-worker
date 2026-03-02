CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE cards (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  VARCHAR(100) UNIQUE NOT NULL,
  name                  VARCHAR(200) NOT NULL,
  bank_name             VARCHAR(100) NOT NULL,
  network               VARCHAR(20) NOT NULL,
  card_tier             VARCHAR(20) NOT NULL,
  
  joining_fee           INTEGER NOT NULL DEFAULT 0,
  annual_fee            INTEGER NOT NULL DEFAULT 0,
  fee_waiver_spend      INTEGER,
  fee_waiver_type       VARCHAR(20),
  
  reward_type           VARCHAR(20) NOT NULL,
  reward_currency_name  VARCHAR(50),
  base_reward_rate      DECIMAL(6,4) NOT NULL,
  point_value_inr       DECIMAL(6,4) NOT NULL DEFAULT 1,
  
  image_url             TEXT,
  card_page_url         TEXT,
  affiliate_url         TEXT,
  earnkaro_id           VARCHAR(100),
  
  is_active             BOOLEAN DEFAULT false,
  is_featured           BOOLEAN DEFAULT false,
  last_crawled_at       TIMESTAMP,
  last_verified_at      TIMESTAMP,
  crawl_source_url      TEXT,
  
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE card_category_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         UUID REFERENCES cards(id) ON DELETE CASCADE,
  
  category        VARCHAR(50) NOT NULL,     
  reward_rate     DECIMAL(6,4) NOT NULL,
  
  reward_type_override  VARCHAR(20),
  point_value_override  DECIMAL(6,4),
  
  is_accelerated  BOOLEAN DEFAULT false,
  notes           TEXT,
  
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_card_category_rules_card_id ON card_category_rules(card_id);

CREATE TABLE card_milestones (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id           UUID REFERENCES cards(id) ON DELETE CASCADE,
  
  milestone_type    VARCHAR(30) NOT NULL,
  spend_threshold   INTEGER NOT NULL,
  threshold_period  VARCHAR(10) DEFAULT 'YEAR',
  
  benefit_points    INTEGER DEFAULT 0,
  benefit_inr_value INTEGER DEFAULT 0,
  fee_waived_amount INTEGER DEFAULT 0,
  
  description       TEXT,
  created_at        TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE,
  phone         VARCHAR(15),
  auth_provider VARCHAR(20),
  
  spend_profile JSONB,
  
  created_at    TIMESTAMP DEFAULT NOW(),
  last_seen_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recommendation_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token   VARCHAR(100) UNIQUE NOT NULL,
  user_id         UUID REFERENCES users(id),
  
  spend_profile   JSONB NOT NULL,
  results_snapshot JSONB NOT NULL,
  
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(100),
  role        VARCHAR(20) DEFAULT 'EDITOR',
  password_hash TEXT NOT NULL,
  
  created_at  TIMESTAMP DEFAULT NOW(),
  last_login  TIMESTAMP
);
