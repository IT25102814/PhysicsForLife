package com.tuition.tuition_management_system.repository;

import com.tuition.tuition_management_system.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BatchRepository extends JpaRepository<Batch, Integer> {
}