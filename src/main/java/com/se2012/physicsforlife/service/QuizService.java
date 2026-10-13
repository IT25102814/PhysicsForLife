package com.physicsforlife.assessmentengine.service; // Adjust package name if necessary

import com.physicsforlife.assessmentengine.entity.Question;
import com.physicsforlife.assessmentengine.entity.Quiz;
import com.physicsforlife.assessmentengine.repository.QuestionRepository;
import com.physicsforlife.assessmentengine.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    public Quiz saveQuizConfig(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    // CHANGED: Integer quizId -> Long quizId
    public Question addQuestion(Long quizId, Question question) {
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
}