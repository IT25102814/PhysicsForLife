package com.physicsforlife.assessmentengine.controller;

import com.physicsforlife.assessmentengine.entity.*;
import com.physicsforlife.assessmentengine.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ResultRepository resultRepository;

    // The default password when you start the server
    private String adminPassword = "admin123";
    private Quiz currentActiveQuiz = new Quiz();

    @PostMapping("/admin/login")
    public ResponseEntity<String> verifyAdmin(@RequestBody Map<String, String> payload) {
        String enteredPassword = payload.get("password");
        if (adminPassword.equals(enteredPassword)) {
            return ResponseEntity.ok("AUTHORIZED");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect Admin Password!");
    }

    // Handles changing the password from the new UI panel
    @PostMapping("/admin/change-password")
    public ResponseEntity<String> changePassword(@RequestBody Map<String, String> payload) {
        if (!adminPassword.equals(payload.get("oldPassword"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Old password is incorrect!");
        }
        this.adminPassword = payload.get("newPassword");
        return ResponseEntity.ok("Password updated successfully!");
    }

    @PostMapping("/admin/config")
    public ResponseEntity<String> saveQuizConfig(@RequestBody Quiz quizConfig) {
        try {
            if (quizConfig.getQuestions() == null) {
                quizConfig.setQuestions(new java.util.ArrayList<>());
            }
            quizConfig.setCreatedAt(LocalDateTime.now());
            quizConfig.setIsActive(true);

            Quiz savedQuiz = quizRepository.save(quizConfig);
            this.currentActiveQuiz = savedQuiz;

            return ResponseEntity.ok("Quiz Configuration Saved! ID: " + savedQuiz.getQuizId());
        } catch (Exception e) {
            String errorMsg = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DATABASE ERROR: " + errorMsg);
        }
    }

    @PostMapping("/admin/add-question")
    public ResponseEntity<String> addQuestionToDB(@RequestBody Question question) {
        try {
            if (currentActiveQuiz.getQuizId() == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please save the Quiz ID and Title first!");
            }

            List<Question> existingQuestions = questionRepository.findByQuiz_QuizId(currentActiveQuiz.getQuizId());

            if (existingQuestions.size() >= currentActiveQuiz.getMaxQuestions()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Limit reached! You can only add a maximum of " + currentActiveQuiz.getMaxQuestions() + " questions.");
            }

            int nextQuestionNo = existingQuestions.size() + 1;
            question.setQuestionNo(nextQuestionNo);
            question.setQuiz(currentActiveQuiz);
            questionRepository.save(question);

            return ResponseEntity.ok("Question " + nextQuestionNo + " successfully added!");

        } catch (Exception e) {
            String errorMsg = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DATABASE ERROR: " + errorMsg);
        }
    }

    @PostMapping("/admin/clear-questions")
    public ResponseEntity<String> clearQuestions() {
        if (currentActiveQuiz.getQuizId() != null) {
            List<Question> questions = questionRepository.findByQuiz_QuizId(currentActiveQuiz.getQuizId());
            questionRepository.deleteAll(questions);
            return ResponseEntity.ok("All questions for this quiz have been deleted from the database.");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No active quiz selected.");
    }

    @GetMapping("/student/data")
    public ResponseEntity<Quiz> getQuizForStudent() {
        Quiz latestQuiz = quizRepository.findTopByOrderByQuizIdDesc();
        if (latestQuiz != null) {
            latestQuiz.setQuestions(questionRepository.findByQuiz_QuizId(latestQuiz.getQuizId()));
        }
        return ResponseEntity.ok(latestQuiz);
    }

    @PostMapping("/student/submit-score")
    public ResponseEntity<String> submitScore(@RequestBody Result result) {
        try {
            result.setStartedAt(LocalDateTime.now().minusMinutes(5));
            result.setSubmittedAt(LocalDateTime.now());
            result.setAutoSubmitted(false);
            resultRepository.save(result);
            return ResponseEntity.ok("Marks securely saved.");
        } catch (Exception e) {
            String errorMsg = e.getCause() != null ? e.getCause().getMessage() : e.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DATABASE ERROR: " + errorMsg);
        }
    }

    @GetMapping("/student/{studentId}/progress")
    public ResponseEntity<List<Result>> getStudentProgress(@PathVariable Long studentId) {
        return ResponseEntity.ok(resultRepository.findByStudentId(studentId));
    }
}