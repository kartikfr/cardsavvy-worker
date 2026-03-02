CREATE TABLE affiliate_clicks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token   VARCHAR(100),
  user_id         UUID REFERENCES users(id),
  card_id         UUID REFERENCES cards(id),
  
  click_source    VARCHAR(50),
  click_position  INTEGER,
  
  ip_address      INET,
  user_agent      TEXT,
  
  created_at      TIMESTAMP DEFAULT NOW()
);
