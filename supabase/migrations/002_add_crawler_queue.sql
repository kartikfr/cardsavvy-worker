CREATE TABLE crawler_queue (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id         UUID REFERENCES cards(id),
  source_url      TEXT NOT NULL,
  status          VARCHAR(20) DEFAULT 'PENDING',
  
  triggered_by    VARCHAR(20),
  raw_html        TEXT,
  extracted_json  JSONB,
  diff_json       JSONB,
  
  error_message   TEXT,
  
  created_at      TIMESTAMP DEFAULT NOW(),
  completed_at    TIMESTAMP
);
