package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.Topic;
import com.frandm.studytracker.backend.model.enums.TopicStatus;
import com.frandm.studytracker.backend.repository.SubjectRepository;
import com.frandm.studytracker.backend.repository.TopicRepository;
import com.frandm.studytracker.backend.security.CurrentUser;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final SubjectRepository subjectRepository;

    public TopicService(TopicRepository topicRepository, SubjectRepository subjectRepository) {
        this.topicRepository = topicRepository;
        this.subjectRepository = subjectRepository;
    }

    public List<Topic> getAll(Long subjectId) {
        if (subjectId != null) {
            return topicRepository.findByUserIdAndSubjectIdOrderBySortOrderAscNameAsc(CurrentUser.id(), subjectId);
        }
        return topicRepository.findByUserIdOrderBySortOrderAscNameAsc(CurrentUser.id());
    }

    public Topic getById(Long id) {
        return topicRepository.findByIdAndUserId(id, CurrentUser.id())
                .orElseThrow(() -> new RuntimeException("Topic not found: " + id));
    }

    public Topic create(String name, Long subjectId, String description, TopicStatus status, Short confidence, Integer sortOrder) {
        requireSubject(subjectId);
        rejectDuplicate(subjectId, name, null);
        Topic topic = new Topic();
        topic.setUserId(CurrentUser.id());
        topic.setCreatedAt(OffsetDateTime.now());
        topic.setName(name);
        topic.setSubjectId(subjectId);
        topic.setDescription(description);
        topic.setStatus(status != null ? status : TopicStatus.not_started);
        topic.setConfidence(confidence);
        topic.setSortOrder(sortOrder != null ? sortOrder : 0);
        topic.setUpdatedAt(OffsetDateTime.now());
        return topicRepository.save(topic);
    }

    public Topic fullUpdate(Long id, String name, Long subjectId, String description, TopicStatus status, Short confidence, Integer sortOrder) {
        Topic topic = getById(id);
        requireSubject(subjectId);
        rejectDuplicate(subjectId, name, topic.getId());
        topic.setName(name);
        topic.setSubjectId(subjectId);
        topic.setDescription(description);
        topic.setStatus(status != null ? status : TopicStatus.not_started);
        topic.setConfidence(confidence);
        topic.setSortOrder(sortOrder != null ? sortOrder : 0);
        topic.setUpdatedAt(OffsetDateTime.now());
        return topicRepository.save(topic);
    }

    public Topic partialUpdate(Long id, String name, Long subjectId, String description, TopicStatus status, Short confidence, Integer sortOrder) {
        Topic topic = getById(id);
        Long nextSubjectId = subjectId != null ? subjectId : topic.getSubjectId();
        String nextName = name != null ? name : topic.getName();
        if (subjectId != null) {
            requireSubject(subjectId);
        }
        if (name != null || subjectId != null) {
            rejectDuplicate(nextSubjectId, nextName, topic.getId());
        }
        if (name != null) topic.setName(name);
        if (subjectId != null) topic.setSubjectId(subjectId);
        if (description != null) topic.setDescription(description);
        if (status != null) topic.setStatus(status);
        if (confidence != null) topic.setConfidence(confidence);
        if (sortOrder != null) topic.setSortOrder(sortOrder);
        topic.setUpdatedAt(OffsetDateTime.now());
        return topicRepository.save(topic);
    }

    public void delete(Long id) {
        Topic topic = getById(id);
        topicRepository.delete(topic);
    }

    private void requireSubject(Long subjectId) {
        if (subjectId == null || subjectRepository.findByIdAndUserId(subjectId, CurrentUser.id()).isEmpty()) {
            throw new RuntimeException("Subject not found: " + subjectId);
        }
    }

    private void rejectDuplicate(Long subjectId, String name, Long exceptId) {
        topicRepository.findByUserIdAndSubjectIdAndName(CurrentUser.id(), subjectId, name).ifPresent(existing -> {
            if (exceptId == null || !exceptId.equals(existing.getId())) {
                throw new RuntimeException("Topic already exists: " + name);
            }
        });
    }
}
