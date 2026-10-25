package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.service.StudyDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/study-data")
public class StudyDataController {

    private final StudyDataService studyDataService;

    public StudyDataController(StudyDataService studyDataService) {
        this.studyDataService = studyDataService;
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteCurrentUserStudyData() {
        studyDataService.deleteCurrentUserStudyData();
        return ResponseEntity.noContent().build();
    }
}
