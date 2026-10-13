package com.se2012.physicsforlife.service;

import com.se2012.physicsforlife.entity.Question;
import com.se2012.physicsforlife.entity.Quiz;
import com.se2012.physicsforlife.entity.QuizResult;
import com.se2012.physicsforlife.repository.QuestionRepository;
import com.se2012.physicsforlife.repository.QuizRepository;
import com.se2012.physicsforlife.repository.QuizResultRepository;
import com.se2012.physicsforlife.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** MEMBER 3 - Assessment business logic. The "current quiz" is always the newest quiz in the database. */
@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizResultRepository resultRepository;
    private final UserRepository userRepository;

    public QuizService(QuizRepository quizRepository,
                       QuestionRepository questionRepository,
                       QuizResultRepository resultRepository,
                       UserRepository userRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.resultRepository = resultRepository;
        this.userRepository = userRepository;
    }

    // ---------- Tutor / Admin ----------

    /** Creates a new quiz and gives it the next free quiz_id. */
    @Transactional
    public synchronized Quiz createQuiz(Quiz config) {
        Quiz last = quizRepository.findTopByOrderByQuizIdDesc();
        config.setQuizId(last == null ? 1 : last.getQuizId() + 1);
        if (config.getTitle() == null || config.getTitle().trim().isEmpty()) {
            config.setTitle("New Quiz");
        }
        if (config.getTimeLimitMinutes() == null) config.setTimeLimitMinutes(10);
        if (config.getMaxQuestions() == null) config.setMaxQuestions(10);
        config.setIsActive(true);
        config.setCreatedAt(LocalDateTime.now());
        return quizRepository.save(config);
    }

    /** Adds a question to the newest quiz. */
    @Transactional
    public Question addQuestionToCurrentQuiz(Question question) {
        Quiz quiz = quizRepository.findTopByOrderByQuizIdDesc();
        if (quiz == null) {
            throw new IllegalStateException("Please save the Quiz ID and Title first!");
        }
        long existing = questionRepository.countByQuiz_QuizId(quiz.getQuizId());
        if (existing >= quiz.getMaxQuestions()) {
            throw new IllegalStateException("Limit reached!");
        }

        List<Question> all = questionRepository.findByQuiz_QuizIdOrderByQuestionNoAsc(quiz.getQuizId());
        int nextNo = all.isEmpty() ? 1 : all.get(all.size() - 1).getQuestionNo() + 1;

        question.setId(null);
        question.setQuiz(quiz);
        question.setQuestionNo(nextNo);
        // The database does not allow empty (NULL) options, e.g. for True/False questions.
        if (question.getOptionC() == null) question.setOptionC("");
        if (question.getOptionD() == null) question.setOptionD("");
        return questionRepository.save(question);
    }

    /** Deletes all questions of the newest quiz. */
    @Transactional
    public void clearCurrentQuizQuestions() {
        Quiz quiz = quizRepository.findTopByOrderByQuizIdDesc();
        if (quiz == null) {
            throw new IllegalStateException("No active quiz selected.");
        }
        questionRepository.deleteAll(questionRepository.findByQuiz_QuizIdOrderByQuestionNoAsc(quiz.getQuizId()));
    }

    // ---------- Student ----------

    /** The newest quiz with its questions, or null if there is no quiz yet. */
    public Quiz getCurrentQuizWithQuestions() {
        Quiz quiz = quizRepository.findTopByOrderByQuizIdDesc();
        if (quiz != null) {
            quiz.setQuestions(questionRepository.findByQuiz_QuizIdOrderByQuestionNoAsc(quiz.getQuizId()));
        }
        return quiz;
    }

    /** Saves a student's mark. Each student can attempt each quiz only once. */
    @Transactional
    public QuizResult submitResult(QuizResult result) {
        if (result.getQuizId() == null || result.getStudentId() == null) {
            throw new IllegalArgumentException("quizId and studentId are required.");
        }
        if (!quizRepository.existsById(result.getQuizId())) {
            throw new IllegalArgumentException("Quiz not found.");
        }
        if (!userRepository.existsById(result.getStudentId())) {
            throw new IllegalArgumentException("Student not found.");
        }
        if (resultRepository.existsByQuizIdAndStudentId(result.getQuizId(), result.getStudentId())) {
            throw new IllegalStateException("You have already completed this assessment.");
        }

        LocalDateTime now = LocalDateTime.now();
        result.setAttemptId(null);
        result.setAutoSubmitted(false);
        result.setStartedAt(now);
        result.setSubmittedAt(now);
        if (result.getMark() == null) result.setMark(BigDecimal.ZERO);
        if (result.getCorrectCount() == null) result.setCorrectCount(0);
        if (result.getTotalQuestions() == null) result.setTotalQuestions(0);
        return resultRepository.save(result);
    }

    public List<QuizResult> getProgress(Long studentId) {
        return resultRepository.findByStudentId(studentId);
    }

    /** Results of the newest quiz with the student names (for the tutor / admin results table). */
    public List<Map<String, Object>> getResultsForCurrentQuiz() {
        List<Map<String, Object>> rows = new ArrayList<>();
        Quiz quiz = quizRepository.findTopByOrderByQuizIdDesc();
        if (quiz == null) return rows;
        for (QuizResult r : resultRepository.findByQuizIdOrderByMarkDesc(quiz.getQuizId())) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("studentId", r.getStudentId());
            row.put("studentName", userRepository.findById(r.getStudentId())
                    .map(u -> u.getFullName()).orElse("Student " + r.getStudentId()));
            row.put("quizId", r.getQuizId());
            row.put("correctCount", r.getCorrectCount());
            row.put("totalQuestions", r.getTotalQuestions());
            row.put("mark", r.getMark());
            row.put("submittedAt", r.getSubmittedAt());
            rows.add(row);
        }
        return rows;
    }
}
