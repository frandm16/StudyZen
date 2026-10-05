ALTER TABLE auth_identities
ALTER COLUMN provider TYPE VARCHAR(20) USING provider::text;