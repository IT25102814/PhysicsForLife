package com.se2012.physicsforlife.repository;

import com.se2012.physicsforlife.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {

    List<QuizResult> findByStudentId(Long studentId);

    List<QuizResult> findByQuizIdOrderByMarkDesc(Integer quizId);

    boolean existsByQuizIdAndStudentId(Integer quizId, Long studentId);
}
