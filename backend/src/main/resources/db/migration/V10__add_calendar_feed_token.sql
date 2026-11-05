ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS calendar_feed_token VARCHAR(64) UNIQUE;

UPDATE user_settings
SET calendar_feed_token = replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
WHERE calendar_feed_token IS NULL;

ALTER TABLE user_settings ALTER COLUMN calendar_feed_token SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_settings_feed_token ON user_settings(calendar_feed_token);
