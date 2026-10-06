WITH ranked_terms AS (
    SELECT id, user_id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY start_date DESC, id DESC) as rn
    FROM academic_terms
    WHERE is_current = TRUE
)
UPDATE academic_terms
SET is_current = FALSE, updated_at = NOW()
WHERE id IN (
    SELECT id FROM ranked_terms WHERE rn > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_academic_terms_one_current
    ON academic_terms(user_id)
    WHERE is_current = TRUE;
