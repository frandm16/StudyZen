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
@CrossOrigin
public class TodoItemController {

    private final TodoItemService todoItemService;

    public TodoItemController(TodoItemService todoItemService) {
        this.todoItemService = todoItemService;
    }

    @GetMapping
    public List<TodoItem> getTodos(@RequestParam String date) {
        return todoItemService.getByDate(LocalDate.parse(date));
    }

    @PostMapping
    public TodoItem createTodo(@RequestBody Map<String, Object> body) {
        return todoItemService.create(
                LocalDate.parse((String) body.get("date")),
                (String) body.get("text")
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateTodo(@PathVariable Long id,
                                           @RequestBody Map<String, Object> body) {
        todoItemService.updateCompleted(id, (Boolean) body.get("completed"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoItemService.delete(id);
        return ResponseEntity.ok().build();
    }
}