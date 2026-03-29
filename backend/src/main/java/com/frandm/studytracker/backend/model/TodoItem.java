package com.frandm.studytracker.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "todo_item")
public class TodoItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(nullable = false)
    private boolean completed = false;

    @Column(nullable = false)
    private int position = 0;

    public Long getId() { return id; }
    public LocalDate getDate() { return date; }
    public String getText() { return text; }
    public boolean isCompleted() { return completed; }
    public int getPosition() { return position; }

    public void setId(Long id) { this.id = id; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setText(String text) { this.text = text; }
    public void setCompleted(boolean c) { this.completed = c; }
    public void setPosition(int position) { this.position = position; }
}