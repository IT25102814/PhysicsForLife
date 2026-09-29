package com.physicsforlife.assessmentengine.repository;
import com.physicsforlife.assessmentengine.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StudentRepository extends JpaRepository<Student, Integer> {}