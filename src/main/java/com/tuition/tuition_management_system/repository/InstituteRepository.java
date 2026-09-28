package com.tuition.tuition_management_system.repository;

import com.tuition.tuition_management_system.entity.Institute;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstituteRepository extends JpaRepository<Institute, Integer> {
}