package com.se2012.physicsforlife.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MEMBER 3 - Assessment: a quiz (table: quizzes).
 * NOTE: the quiz_id column in our shared database is NOT auto-increment,
 * so QuizService gives every new quiz the next free number.
 */
@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @Column(name = "quiz_id")
    private Integer quizId;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "time_limit_minutes", nullable = false)
    private Integer timeLimitMinutes;

    @Column(name = "max_questions", nullable = false)
    private Integer maxQuestions;

    @Column(name = "batch_id")
    private Integer batchId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Not a database column: filled in only when a student starts the quiz.
    @Transient
    private List<Question> questions = new ArrayList<>();

    public Quiz() {}

    public Integer getQuizId() { return quizId; }
    public void setQuizId(Integer quizId) { this.quizId = quizId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

    public Integer getMaxQuestions() { return maxQuestions; }
    public void setMaxQuestions(Integer maxQuestions) { this.maxQuestions = maxQuestions; }

    public Integer getBatchId() { return batchId; }
    public void setBatchId(Integer batchId) { this.batchId = batchId; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
}
