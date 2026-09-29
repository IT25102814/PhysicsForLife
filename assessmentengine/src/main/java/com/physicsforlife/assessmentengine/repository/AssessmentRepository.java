package com.physicsforlife.assessmentengine.repository;
import com.physicsforlife.assessmentengine.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AssessmentRepository extends JpaRepository<Assessment, Integer> {}