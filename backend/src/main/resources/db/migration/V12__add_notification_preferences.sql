ALTER TABLE user_settings
    ADD COLUMN notify_exam_7d          BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_exam_3d          BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_exam_24h         BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_deadline_7d      BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_deadline_3d      BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_deadline_24h     BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_deadline_completed BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_session_logged   BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notify_topic_mastered   BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_goal_reached     BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN notify_goal_80pct       BOOLEAN NOT NULL DEFAULT FALSE;
