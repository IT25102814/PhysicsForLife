package com.tuition.tuition_management_system.repository;

import com.tuition.tuition_management_system.entity.Curriculum;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CurriculumRepository extends JpaRepository<Curriculum, Integer> {
}