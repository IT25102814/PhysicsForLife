package com.se2012.physicsforlife.repository;

import com.se2012.physicsforlife.entity.CourseBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseBatchRepository extends JpaRepository<CourseBatch, Integer> {
}