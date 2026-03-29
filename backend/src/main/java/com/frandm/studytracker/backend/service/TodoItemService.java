package com.frandm.studytracker.backend.service;

import com.frandm.studytracker.backend.model.TodoItem;
import com.frandm.studytracker.backend.repository.TodoItemRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class TodoItemService {

    private final TodoItemRepository todoItemRepository;

    public TodoItemService(TodoItemRepository todoItemRepository) {
        this.todoItemRepository = todoItemRepository;
    }

    public List<TodoItem> getByDate(LocalDate date) {
        return todoItemRepository.findByDateOrderByPositionAsc(date);
    }

    public TodoItem create(LocalDate date, String text) {
        int nextPos = todoItemRepository.findByDateOrderByPositionAsc(date).size();
        TodoItem item = new TodoItem();
        item.setDate(date);
        item.setText(text);
        item.setPosition(nextPos);
        return todoItemRepository.save(item);
    }

    public TodoItem updateCompleted(Long id, boolean completed) {
        TodoItem item = todoItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TodoItem not found: " + id));
        item.setCompleted(completed);
        return todoItemRepository.save(item);
    }

    public void delete(Long id) {
        todoItemRepository.deleteById(id);
    }
}