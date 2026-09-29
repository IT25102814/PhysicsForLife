package com.se2012.physicsforlife.repository;

import com.se2012.physicsforlife.entity.Enrollment;
import com.se2012.physicsforlife.entity.AppUser;
import com.se2012.physicsforlife.entity.CourseBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    // Finds all courses a specific student is enrolled in
    List<Enrollment> findByStudent(AppUser student);

    // Checks if a student is already enrolled in a specific batch
    Optional<Enrollment> findByStudentAndCourseBatch(AppUser student, CourseBatch courseBatch);
}