package com.physicsforlife.assessmentengine.repository;
import com.physicsforlife.assessmentengine.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {
    Quiz findTopByOrderByQuizIdDesc();
}