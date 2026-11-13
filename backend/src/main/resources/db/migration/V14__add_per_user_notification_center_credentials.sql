ALTER TABLE user_settings
    ADD COLUMN notification_center_url VARCHAR(500),
    ADD COLUMN notification_center_token VARCHAR(1000);
