ALTER TABLE user_settings
    ADD COLUMN notify_center_exam_7d BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_center_exam_3d BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_center_exam_24h BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_center_deadline_7d BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_center_deadline_3d BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_center_deadline_24h BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_center_deadline_completed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_center_session_logged BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_center_topic_mastered BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_center_goal_reached BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_center_goal_80pct BOOLEAN NOT NULL DEFAULT FALSE;
