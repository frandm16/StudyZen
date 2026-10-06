CREATE UNIQUE INDEX IF NOT EXISTS ux_academic_terms_one_current
    ON academic_terms(user_id)
    WHERE is_current = TRUE;
