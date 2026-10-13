package com.se2012.physicsforlife.repository;

import com.se2012.physicsforlife.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {

    // The newest quiz = the one with the highest quiz_id
    Quiz findTopByOrderByQuizIdDesc();
}
