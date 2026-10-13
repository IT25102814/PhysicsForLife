package com.se2012.physicsforlife.controller;

import com.se2012.physicsforlife.entity.Question;
import com.se2012.physicsforlife.entity.Quiz;
import com.se2012.physicsforlife.entity.QuizResult;
import com.se2012.physicsforlife.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * MEMBER 3 - Assessment API.
 * /api/quiz/admin/**   -> for tutors and admins (role check is added in the security step)
 * /api/quiz/student/** -> for students
 */
@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // ---------- Tutor / Admin ----------

    @PostMapping("/admin/config")
    public ResponseEntity<String> saveQuizConfig(@RequestBody Quiz quizConfig) {
        try {
            Quiz saved = quizService.createQuiz(quizConfig);
            return ResponseEntity.ok("Quiz Configuration Saved! ID: " + saved.getQuizId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DATABASE ERROR: " + rootMessage(e));
        }
    }

    @PostMapping("/admin/add-question")
    public ResponseEntity<String> addQuestion(@RequestBody Question question) {
        try {
            quizService.addQuestionToCurrentQuiz(question);
            return ResponseEntity.ok("Question successfully added!");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DATABASE ERROR: " + rootMessage(e));
        }
    }

    @PostMapping("/admin/clear-questions")
    public ResponseEntity<String> clearQuestions() {
        try {
            quizService.clearCurrentQuizQuestions();
            return ResponseEntity.ok("All questions deleted.");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DATABASE ERROR: " + rootMessage(e));
        }
    }

    @GetMapping("/admin/results")
    public ResponseEntity<List<Map<String, Object>>> getResults() {
        return ResponseEntity.ok(quizService.getResultsForCurrentQuiz());
    }

    // ---------- Student ----------

    @GetMapping("/student/data")
    public ResponseEntity<?> getQuizForStudent() {
        Quiz quiz = quizService.getCurrentQuizWithQuestions();
        if (quiz == null) {
            return ResponseEntity.ok(Map.of());   // no quiz yet: the page shows "No questions available"
        }
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/student/submit-score")
    public ResponseEntity<String> submitScore(@RequestBody QuizResult result) {
        try {
            quizService.submitResult(result);
            return ResponseEntity.ok("Marks securely saved.");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DATABASE ERROR: " + rootMessage(e));
        }
    }

    @GetMapping("/student/{studentId}/progress")
    public ResponseEntity<List<QuizResult>> getStudentProgress(@PathVariable Long studentId) {
        return ResponseEntity.ok(quizService.getProgress(studentId));
    }

    // Shows the real reason of a database error (for example the trigger message).
    private String rootMessage(Throwable e) {
        Throwable t = e;
        while (t.getCause() != null) t = t.getCause();
        return t.getMessage();
    }
}
