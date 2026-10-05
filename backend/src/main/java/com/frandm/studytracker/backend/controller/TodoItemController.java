package com.frandm.studytracker.backend.controller;

import com.frandm.studytracker.backend.model.TodoItem;
import com.frandm.studytracker.backend.service.TodoItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/todos")
public class TodoItemController {

    private final TodoItemService todoItemService;

    public TodoItemController(TodoItemService todoItemService) {
        this.todoItemService = todoItemService;
    }

    @GetMapping
    public List<TodoItem> list(@RequestParam(required = false) String date) {
        LocalDate parsedDate = null;
        if (date != null && !date.isBlank()) {
            parsedDate = LocalDate.parse(date);
        }
        return todoItemService.list(parsedDate);
    }

    @GetMapping("/{id}")
    public TodoItem get(@PathVariable Long id) {
        return todoItemService.getById(id);
    }

    @PostMapping
    public TodoItem create(@RequestBody Map<String, Object> body) {
        return todoItemService.create(body);
    }

    @PutMapping("/{id}")
    public TodoItem update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return todoItemService.fullUpdate(id, body);
    }

    @PatchMapping("/{id}")
    public TodoItem patch(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return todoItemService.partialUpdate(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        todoItemService.delete(id);
        return ResponseEntity.ok().build();
    }
}
