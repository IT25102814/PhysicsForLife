package com.se2012.physicsforlife.repository;

import com.se2012.physicsforlife.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByQuiz_QuizIdOrderByQuestionNoAsc(Integer quizId);

    long countByQuiz_QuizId(Integer quizId);
}
