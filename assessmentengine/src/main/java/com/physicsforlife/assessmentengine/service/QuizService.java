package com.physicsforlife.assessmentengine.service;

import com.physicsforlife.assessmentengine.entity.*;
import com.physicsforlife.assessmentengine.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private ResultRepository resultRepository;

    public Quiz saveQuizConfig(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public Question addQuestion(Integer quizId, Question question) {
        Optional<Quiz> optionalQuiz = quizRepository.findById(quizId);
        if (optionalQuiz.isPresent()) {
            question.setQuiz(optionalQuiz.get());
            return questionRepository.save(question);
        }
        throw new RuntimeException("Quiz not found");
    }

    public Quiz getLatestQuizForStudent() {
        return quizRepository.findTopByOrderByQuizIdDesc();
    }

    public void saveStudentResult(Result result) {
        result.setSubmittedAt(LocalDateTime.now());
        resultRepository.save(result);
    }

    public List<Result> getStudentProgress(Long studentId) {
        return resultRepository.findByStudentId(studentId);
    }
}
