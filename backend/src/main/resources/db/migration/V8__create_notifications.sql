CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body VARCHAR(2000) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_type_check CHECK (type IN ('info', 'success', 'warning', 'error'))
);

CREATE INDEX idx_notifications_user_created_at ON notifications (user_id, created_at DESC, id DESC);
CREATE INDEX idx_notifications_user_unread ON notifications (user_id) WHERE is_read = FALSE;
