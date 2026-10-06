ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_confidence_check;
ALTER TABLE topics ADD CONSTRAINT topics_confidence_check
    CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 5));

ALTER TABLE study_sessions DROP CONSTRAINT IF EXISTS study_sessions_focus_rating_check;
ALTER TABLE study_sessions ADD CONSTRAINT study_sessions_focus_rating_check
    CHECK (focus_rating IS NULL OR (focus_rating >= 0 AND focus_rating <= 5));
