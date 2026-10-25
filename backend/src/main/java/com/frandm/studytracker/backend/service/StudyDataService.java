package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.security.CurrentUser;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class StudyDataService {

    private static final List<String> USER_DATA_TABLES = List.of(
            "notifications",
            "todo_items",
            "day_notes",
            "deadlines",
            "study_sessions",
            "scheduled_sessions",
            "assessments",
            "study_goals",
            "topics",
            "subjects",
            "academic_terms"
    );

    private final JdbcTemplate jdbcTemplate;

    public StudyDataService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void deleteCurrentUserStudyData() {
        UUID userId = CurrentUser.id();
        for (String table : USER_DATA_TABLES) {
            jdbcTemplate.update("DELETE FROM " + table + " WHERE user_id = ?", userId);
        }
    }
}
