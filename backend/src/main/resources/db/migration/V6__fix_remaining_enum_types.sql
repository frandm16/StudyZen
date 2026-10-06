ALTER TABLE scheduled_sessions ALTER COLUMN status DROP DEFAULT;
ALTER TABLE scheduled_sessions ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE scheduled_sessions ALTER COLUMN status SET DEFAULT 'scheduled';

ALTER TABLE study_goals ALTER COLUMN period TYPE VARCHAR(50) USING period::text;

ALTER TABLE verification_tokens ALTER COLUMN purpose TYPE VARCHAR(50) USING purpose::text;
