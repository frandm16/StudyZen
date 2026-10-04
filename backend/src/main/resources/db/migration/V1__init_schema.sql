BEGIN;

CREATE TYPE deadline_type AS ENUM (
    'assignment',
    'exam',
    'quiz',
    'project',
    'presentation',
    'lab',
    'other'
);

CREATE TYPE urgency_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE topic_status AS ENUM (
    'not_started',
    'in_progress',
    'reviewing',
    'mastered'
);

CREATE TYPE goal_period AS ENUM (
    'daily',
    'weekly'
);

CREATE TYPE auth_provider AS ENUM (
    'google',
    'github',
    'apple',
    'microsoft'
);

CREATE TYPE token_purpose AS ENUM (
    'email_verification',
    'password_reset'
);

CREATE TYPE scheduled_session_status AS ENUM (
    'scheduled',
    'completed',
    'cancelled',
    'skipped'
);

CREATE TYPE assessment_type AS ENUM (
    'assignment',
    'exam',
    'quiz',
    'project',
    'presentation',
    'lab',
    'midterm',
    'final_exam',
    'other'
);


CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,

    email_verified_at TIMESTAMPTZ,


    password_hash TEXT,

    display_name VARCHAR(100),

    avatar_url TEXT,

    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',

    locale VARCHAR(10) NOT NULL DEFAULT 'en',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_not_blank
        CHECK (btrim(email) <> ''),

    CONSTRAINT users_timezone_not_blank
        CHECK (btrim(timezone) <> '')
);


CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY,

    week_starts_on SMALLINT NOT NULL DEFAULT 1,

    default_session_minutes INTEGER NOT NULL DEFAULT 50,

    theme VARCHAR(16) NOT NULL DEFAULT 'system',

    grade_scale_max NUMERIC(5,2) NOT NULL DEFAULT 10,

    pass_grade NUMERIC(5,2) NOT NULL DEFAULT 5,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT user_settings_week_starts_on_check
        CHECK (week_starts_on BETWEEN 0 AND 6),

    CONSTRAINT user_settings_session_minutes_check
        CHECK (default_session_minutes > 0),

    CONSTRAINT user_settings_grade_scale_check
        CHECK (grade_scale_max > 0),

    CONSTRAINT user_settings_pass_grade_check
        CHECK (
            pass_grade >= 0
            AND pass_grade <= grade_scale_max
        ),

    CONSTRAINT user_settings_theme_check
        CHECK (theme IN ('system', 'light', 'dark')),

    CONSTRAINT user_settings_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE TABLE auth_identities (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    provider auth_provider NOT NULL,

    provider_user_id VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT auth_identities_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT auth_identities_provider_user_unique
        UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_auth_identities_user_id
    ON auth_identities(user_id);


CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    user_agent TEXT,

    ip_address INET,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    last_used_at TIMESTAMPTZ,

    replaced_by_token_id UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT refresh_tokens_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT refresh_tokens_replaced_by_fk
        FOREIGN KEY (replaced_by_token_id)
        REFERENCES refresh_tokens(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_refresh_tokens_user_id
    ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_tokens_expires_at
    ON refresh_tokens(expires_at);

CREATE INDEX idx_refresh_tokens_user_revoked
    ON refresh_tokens(user_id, revoked_at);


CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    purpose token_purpose NOT NULL,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT verification_tokens_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_verification_tokens_user_id
    ON verification_tokens(user_id);

CREATE INDEX idx_verification_tokens_user_purpose
    ON verification_tokens(user_id, purpose);

CREATE INDEX idx_verification_tokens_expires_at
    ON verification_tokens(expires_at);


CREATE TABLE academic_terms (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    name VARCHAR(255) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    is_current BOOLEAN NOT NULL DEFAULT FALSE,

    is_archived BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT academic_terms_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT academic_terms_dates_check
        CHECK (end_date >= start_date),

    CONSTRAINT academic_terms_name_not_blank
        CHECK (btrim(name) <> ''),

    CONSTRAINT academic_terms_id_user_unique
        UNIQUE (id, user_id)
);

CREATE INDEX idx_academic_terms_user_start
    ON academic_terms(user_id, start_date);

CREATE INDEX idx_academic_terms_user_archived
    ON academic_terms(user_id, is_archived);

CREATE INDEX idx_academic_terms_user_current
    ON academic_terms(user_id, is_current);


CREATE UNIQUE INDEX ux_academic_terms_one_current
    ON academic_terms(user_id)
    WHERE is_current = TRUE;


CREATE TABLE subjects (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    term_id BIGINT NOT NULL,

    name VARCHAR(255) NOT NULL,

    color VARCHAR(16),

    notes TEXT,

    is_archived BOOLEAN NOT NULL DEFAULT FALSE,

    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT subjects_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,



    CONSTRAINT subjects_term_user_fk
        FOREIGN KEY (term_id, user_id)
        REFERENCES academic_terms(id, user_id)
        ON DELETE CASCADE,

    CONSTRAINT subjects_name_not_blank
        CHECK (btrim(name) <> ''),

    CONSTRAINT subjects_id_user_unique
        UNIQUE (id, user_id),

    CONSTRAINT subjects_user_term_name_unique
        UNIQUE (user_id, term_id, name)
);

CREATE INDEX idx_subjects_user_term
    ON subjects(user_id, term_id);

CREATE INDEX idx_subjects_user_archived
    ON subjects(user_id, is_archived);

CREATE INDEX idx_subjects_user_favorite
    ON subjects(user_id, is_favorite);


CREATE TABLE topics (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    subject_id BIGINT NOT NULL,

    name VARCHAR(255) NOT NULL,

    description TEXT,

    status topic_status NOT NULL DEFAULT 'not_started',

    confidence SMALLINT,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT topics_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,


    CONSTRAINT topics_subject_user_fk
        FOREIGN KEY (subject_id, user_id)
        REFERENCES subjects(id, user_id)
        ON DELETE CASCADE,

    CONSTRAINT topics_confidence_check
        CHECK (
            confidence IS NULL
            OR confidence BETWEEN 1 AND 5
        ),

    CONSTRAINT topics_name_not_blank
        CHECK (btrim(name) <> ''),

    CONSTRAINT topics_id_user_unique
        UNIQUE (id, user_id),

    CONSTRAINT topics_subject_name_unique
        UNIQUE (subject_id, name)
);

CREATE INDEX idx_topics_user_subject
    ON topics(user_id, subject_id);

CREATE INDEX idx_topics_user_status
    ON topics(user_id, status);


CREATE TABLE assessments (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    subject_id BIGINT NOT NULL,

    type assessment_type NOT NULL DEFAULT 'other',

    title VARCHAR(255) NOT NULL,

    description TEXT,

    grade NUMERIC(5,2),

    max_grade NUMERIC(5,2) NOT NULL,

    weight_percent NUMERIC(5,2) NOT NULL,

    due_at TIMESTAMPTZ,

    is_completed BOOLEAN NOT NULL DEFAULT FALSE,

    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT assessments_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT assessments_subject_user_fk
        FOREIGN KEY (subject_id, user_id)
        REFERENCES subjects(id, user_id)
        ON DELETE CASCADE,

    CONSTRAINT assessments_title_not_blank
        CHECK (btrim(title) <> ''),

    CONSTRAINT assessments_max_grade_check
        CHECK (max_grade > 0),

    CONSTRAINT assessments_grade_check
        CHECK (
            grade IS NULL
            OR (
                grade >= 0
                AND grade <= max_grade
            )
        ),

    CONSTRAINT assessments_weight_check
        CHECK (
            weight_percent >= 0
            AND weight_percent <= 100
        ),

    CONSTRAINT assessments_completed_at_check
        CHECK (
            is_completed = TRUE
            OR completed_at IS NULL
        ),

    CONSTRAINT assessments_id_user_unique
        UNIQUE (id, user_id)
);

CREATE INDEX idx_assessments_user_subject
    ON assessments(user_id, subject_id);

CREATE INDEX idx_assessments_user_due
    ON assessments(user_id, due_at);

CREATE INDEX idx_assessments_user_completed
    ON assessments(user_id, is_completed);


CREATE TABLE scheduled_sessions (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    topic_id BIGINT NOT NULL,

    title TEXT,

    starts_at TIMESTAMPTZ NOT NULL,

    ends_at TIMESTAMPTZ NOT NULL,

    status scheduled_session_status NOT NULL DEFAULT 'scheduled',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT scheduled_sessions_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT scheduled_sessions_topic_user_fk
        FOREIGN KEY (topic_id, user_id)
        REFERENCES topics(id, user_id)
        ON DELETE CASCADE,

    CONSTRAINT scheduled_sessions_time_check
        CHECK (ends_at > starts_at),

    CONSTRAINT scheduled_sessions_id_user_unique
        UNIQUE (id, user_id)
);

CREATE INDEX idx_scheduled_sessions_user_start
    ON scheduled_sessions(user_id, starts_at);

CREATE INDEX idx_scheduled_sessions_user_status
    ON scheduled_sessions(user_id, status);

CREATE INDEX idx_scheduled_sessions_topic_start
    ON scheduled_sessions(topic_id, starts_at);


CREATE TABLE study_sessions (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    topic_id BIGINT NOT NULL,

    scheduled_session_id BIGINT,

    title TEXT,

    description TEXT,

    total_minutes INTEGER NOT NULL,

    paused_minutes INTEGER NOT NULL DEFAULT 0,

    focus_rating SMALLINT,

    started_at TIMESTAMPTZ NOT NULL,

    ended_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT study_sessions_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT study_sessions_topic_user_fk
        FOREIGN KEY (topic_id, user_id)
        REFERENCES topics(id, user_id)
        ON DELETE CASCADE,


    CONSTRAINT study_sessions_scheduled_user_fk
        FOREIGN KEY (scheduled_session_id, user_id)
        REFERENCES scheduled_sessions(id, user_id)
        ON DELETE SET NULL,

    CONSTRAINT study_sessions_time_check
        CHECK (ended_at > started_at),

    CONSTRAINT study_sessions_total_minutes_check
        CHECK (total_minutes > 0),

    CONSTRAINT study_sessions_paused_minutes_check
        CHECK (
            paused_minutes >= 0
            AND paused_minutes <= total_minutes
        ),

    CONSTRAINT study_sessions_focus_rating_check
        CHECK (
            focus_rating IS NULL
            OR focus_rating BETWEEN 1 AND 5
        ),

    CONSTRAINT study_sessions_id_user_unique
        UNIQUE (id, user_id)
);

CREATE INDEX idx_study_sessions_user_started
    ON study_sessions(user_id, started_at);

CREATE INDEX idx_study_sessions_user_topic_started
    ON study_sessions(user_id, topic_id, started_at);

CREATE INDEX idx_study_sessions_scheduled
    ON study_sessions(scheduled_session_id);


CREATE TABLE study_goals (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    subject_id BIGINT,

    period goal_period NOT NULL,

    target_minutes INTEGER NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT study_goals_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT study_goals_subject_user_fk
        FOREIGN KEY (subject_id, user_id)
        REFERENCES subjects(id, user_id)
        ON DELETE CASCADE,

    CONSTRAINT study_goals_target_minutes_check
        CHECK (target_minutes > 0),

    CONSTRAINT study_goals_id_user_unique
        UNIQUE (id, user_id)
);

CREATE INDEX idx_study_goals_user_period
    ON study_goals(user_id, period);

CREATE INDEX idx_study_goals_user_subject_period
    ON study_goals(user_id, subject_id, period);


CREATE UNIQUE INDEX ux_study_goals_global
    ON study_goals(user_id, period)
    WHERE subject_id IS NULL;


CREATE UNIQUE INDEX ux_study_goals_subject
    ON study_goals(user_id, subject_id, period)
    WHERE subject_id IS NOT NULL;


CREATE TABLE deadlines (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    subject_id BIGINT,

    topic_id BIGINT,

    type deadline_type NOT NULL DEFAULT 'assignment',

    title VARCHAR(255) NOT NULL,

    description TEXT,

    urgency urgency_level NOT NULL DEFAULT 'medium',

    all_day BOOLEAN NOT NULL DEFAULT FALSE,

    due_at TIMESTAMPTZ NOT NULL,

    is_completed BOOLEAN NOT NULL DEFAULT FALSE,

    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT deadlines_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT deadlines_subject_user_fk
        FOREIGN KEY (subject_id, user_id)
        REFERENCES subjects(id, user_id)
        ON DELETE CASCADE,

    CONSTRAINT deadlines_topic_user_fk
        FOREIGN KEY (topic_id, user_id)
        REFERENCES topics(id, user_id)
        ON DELETE CASCADE,

    CONSTRAINT deadlines_title_not_blank
        CHECK (btrim(title) <> ''),


    CONSTRAINT deadlines_topic_requires_subject
        CHECK (
            topic_id IS NULL
            OR subject_id IS NOT NULL
        ),

    CONSTRAINT deadlines_completed_at_check
        CHECK (
            is_completed = TRUE
            OR completed_at IS NULL
        ),

    CONSTRAINT deadlines_id_user_unique
        UNIQUE (id, user_id)
);

CREATE INDEX idx_deadlines_user_due
    ON deadlines(user_id, due_at);

CREATE INDEX idx_deadlines_user_completed
    ON deadlines(user_id, is_completed);

CREATE INDEX idx_deadlines_subject_due
    ON deadlines(subject_id, due_at);

CREATE INDEX idx_deadlines_topic_due
    ON deadlines(topic_id, due_at);


CREATE TABLE day_notes (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    date DATE NOT NULL,

    content TEXT NOT NULL DEFAULT '',

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT day_notes_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT day_notes_id_user_unique
        UNIQUE (id, user_id),



    CONSTRAINT day_notes_user_date_unique
        UNIQUE (user_id, date)
);


CREATE TABLE todo_items (
    id BIGSERIAL PRIMARY KEY,

    user_id UUID NOT NULL,

    subject_id BIGINT,

    topic_id BIGINT,

    date DATE NOT NULL,

    text VARCHAR(255) NOT NULL,

    is_completed BOOLEAN NOT NULL DEFAULT FALSE,

    completed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT todo_items_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT todo_items_subject_user_fk
        FOREIGN KEY (subject_id, user_id)
        REFERENCES subjects(id, user_id)
        ON DELETE SET NULL,

    CONSTRAINT todo_items_topic_user_fk
        FOREIGN KEY (topic_id, user_id)
        REFERENCES topics(id, user_id)
        ON DELETE SET NULL,

    CONSTRAINT todo_items_text_not_blank
        CHECK (btrim(text) <> ''),


    CONSTRAINT todo_items_topic_requires_subject
        CHECK (
            topic_id IS NULL
            OR subject_id IS NOT NULL
        ),

    CONSTRAINT todo_items_id_user_unique
        UNIQUE (id, user_id)
);

CREATE INDEX idx_todo_items_user_date
    ON todo_items(user_id, date);

CREATE INDEX idx_todo_items_user_date_completed
    ON todo_items(user_id, date, is_completed);

CREATE INDEX idx_todo_items_subject_completed
    ON todo_items(subject_id, is_completed);

CREATE INDEX idx_todo_items_topic_completed
    ON todo_items(topic_id, is_completed);


CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_settings_updated_at
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_academic_terms_updated_at
BEFORE UPDATE ON academic_terms
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_subjects_updated_at
BEFORE UPDATE ON subjects
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_topics_updated_at
BEFORE UPDATE ON topics
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_assessments_updated_at
BEFORE UPDATE ON assessments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_scheduled_sessions_updated_at
BEFORE UPDATE ON scheduled_sessions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_study_goals_updated_at
BEFORE UPDATE ON study_goals
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_deadlines_updated_at
BEFORE UPDATE ON deadlines
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();