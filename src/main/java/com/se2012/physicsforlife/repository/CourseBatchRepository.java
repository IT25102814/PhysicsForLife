package com.se2012.physicsforlife.repository;

import com.se2012.physicsforlife.entity.CourseBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseBatchRepository extends JpaRepository<CourseBatch, Long> {
    // Custom query to find all active batches for students to enroll in
    List<CourseBatch> findByIsActiveTrue();
}