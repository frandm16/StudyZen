package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.StudySession;
import com.frandm.studytracker.backend.model.Topic;
import com.frandm.studytracker.backend.model.Subject;
import com.frandm.studytracker.backend.repository.StudySessionRepository;
import com.frandm.studytracker.backend.repository.TopicRepository;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import com.frandm.studytracker.backend.util.DateTimeUtils;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StatsService {

    private final StudySessionRepository studySessionRepository;
    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;

    public StatsService(StudySessionRepository studySessionRepository,
                        TopicRepository topicRepository,
                        SubjectRepository subjectRepository) {
        this.studySessionRepository = studySessionRepository;
        this.topicRepository = topicRepository;
        this.subjectRepository = subjectRepository;
    }

    public Map<LocalDate, Integer> getHeatmap() {
        UUID userId = CurrentUser.id();
        OffsetDateTime from = OffsetDateTime.now().minusYears(1);
        OffsetDateTime to = OffsetDateTime.now();
        List<StudySession> sessions = studySessionRepository.findByUserIdAndDateRange(userId, from, to);
        return sessions.stream().collect(Collectors.groupingBy(
                s -> s.getStartedAt().toLocalDate(),
                LinkedHashMap::new,
                Collectors.summingInt(StudySession::getTotalMinutes)
        ));
    }

    public Map<String, Integer> getSummaryBySubject(Long subjectId) {
        UUID userId = CurrentUser.id();
        List<StudySession> sessions = studySessionRepository.findByUserIdOrderByStartedAtDesc(userId);
        List<Topic> userTopics = topicRepository.findByUserIdOrderBySortOrderAscNameAsc(userId);
        Map<Long, Topic> topicsMap = userTopics.stream()
                .collect(Collectors.toMap(Topic::getId, t -> t));

        Map<String, Integer> summary = new LinkedHashMap<>();
        sessions.stream()
                .filter(s -> {
                    Topic topic = topicsMap.get(s.getTopicId());
                    return topic != null && topic.getSubjectId().equals(subjectId);
                })
                .forEach(s -> {
                    Topic topic = topicsMap.get(s.getTopicId());
                    summary.merge(topic.getName(), s.getTotalMinutes(), Integer::sum);
                });
        return summary;
    }

    public List<Map<String, Object>> getAllSessionsForStats() {
        UUID userId = CurrentUser.id();
        List<StudySession> sessions = studySessionRepository.findByUserIdOrderByStartedAtDesc(userId);
        List<Topic> userTopics = topicRepository.findByUserIdOrderBySortOrderAscNameAsc(userId);
        Map<Long, Topic> topicsMap = userTopics.stream()
                .collect(Collectors.toMap(Topic::getId, t -> t));

        return sessions.stream().map(s -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", s.getId());

            Topic topic = topicsMap.get(s.getTopicId());
            String subjectName = null;
            String subjectColor = null;
            if (topic != null) {
                var subject = subjectRepository.findByIdAndUserId(topic.getSubjectId(), userId);
                if (subject.isPresent()) {
                    subjectName = subject.get().getName();
                    subjectColor = subject.get().getColor();
                }
                map.put("topic", topic.getName());
            } else {
                map.put("topic", null);
            }

            map.put("subject", subjectName);
            map.put("subjectColor", subjectColor);
            map.put("title", s.getTitle());
            map.put("description", s.getDescription());
            map.put("totalMinutes", s.getTotalMinutes());
            map.put("startedAt", DateTimeUtils.formatApiTimestamp(s.getStartedAt()));
            map.put("endedAt", s.getEndedAt() != null ? DateTimeUtils.formatApiTimestamp(s.getEndedAt()) : null);
            map.put("focusRating", s.getFocusRating());
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, Double> getWeeklyStats() {
        UUID userId = CurrentUser.id();
        OffsetDateTime from = OffsetDateTime.now().minusWeeks(12);
        OffsetDateTime to = OffsetDateTime.now();
        List<StudySession> sessions = studySessionRepository.findByUserIdAndDateRange(userId, from, to);
        return sessions.stream().collect(Collectors.groupingBy(
                s -> s.getStartedAt().toLocalDate()
                        .with(DayOfWeek.MONDAY).toString(),
                LinkedHashMap::new,
                Collectors.summingDouble(s -> s.getTotalMinutes() / 60.0)
        ));
    }
}
