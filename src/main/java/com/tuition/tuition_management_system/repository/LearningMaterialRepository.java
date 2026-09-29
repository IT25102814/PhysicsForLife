package com.tuition.tuition_management_system.repository;

import com.tuition.tuition_management_system.entity.LearningMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, Long> {
}