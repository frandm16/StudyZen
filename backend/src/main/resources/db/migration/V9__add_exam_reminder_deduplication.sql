ALTER TABLE notifications ADD COLUMN reminder_key VARCHAR(100);
CREATE UNIQUE INDEX uq_notifications_reminder_key ON notifications (reminder_key) WHERE reminder_key IS NOT NULL;
