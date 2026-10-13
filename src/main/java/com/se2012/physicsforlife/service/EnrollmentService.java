package com.se2012.physicsforlife.service;

import com.se2012.physicsforlife.entity.AppUser;
import com.se2012.physicsforlife.entity.CourseBatch;
import com.se2012.physicsforlife.entity.Enrollment;
import com.se2012.physicsforlife.entity.EnrollmentStatus;
import com.se2012.physicsforlife.repository.CourseBatchRepository;
import com.se2012.physicsforlife.repository.EnrollmentRepository;
import com.se2012.physicsforlife.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseBatchRepository courseBatchRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             UserRepository userRepository,
                             CourseBatchRepository courseBatchRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseBatchRepository = courseBatchRepository;
    }

    // Core function: Enroll a student into a batch (batchId is Integer to match CourseBatch)
    public Enrollment enrollStudent(Long studentId, Integer batchId) {
        AppUser student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        CourseBatch batch = courseBatchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Course batch not found."));

        java.util.Optional<Enrollment> existing = enrollmentRepository.findByStudentAndCourseBatch(student, batch);
        if (existing.isPresent()) {
            Enrollment old = existing.get();
            // A student who left earlier can join again: just switch the old record back to ACTIVE.
            if (old.getStatus() == EnrollmentStatus.WITHDRAWN) {
                old.setStatus(EnrollmentStatus.ACTIVE);
                return enrollmentRepository.save(old);
            }
            throw new IllegalStateException("You are already enrolled in this batch!");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourseBatch(batch);
        enrollment.setStatus(EnrollmentStatus.ACTIVE); // Default status

        return enrollmentRepository.save(enrollment);
    }

    // View all enrollments for a specific student
    public List<Enrollment> getStudentEnrollments(Long studentId) {
        AppUser student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        return enrollmentRepository.findByStudent(student);
    }

    // Update enrollment status (e.g., ACTIVE to SUSPENDED)
    public Enrollment updateEnrollmentStatus(Long enrollmentId, EnrollmentStatus status) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found."));

        enrollment.setStatus(status);
        return enrollmentRepository.save(enrollment);
    }

    // Delete / Remove an enrollment
    public void deleteEnrollment(Long enrollmentId) {
        if (!enrollmentRepository.existsById(enrollmentId)) {
            throw new IllegalArgumentException("Enrollment not found.");
        }
        enrollmentRepository.deleteById(enrollmentId);
    }

    // A student leaves a class by himself. The record is kept (status WITHDRAWN) so history stays correct.
    public Enrollment leaveBatch(Long enrollmentId, Long studentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new IllegalArgumentException("Enrollment not found."));

        if (enrollment.getStudent() == null || !enrollment.getStudent().getUserId().equals(studentId)) {
            throw new IllegalArgumentException("This enrollment does not belong to you.");
        }
        if (enrollment.getStatus() != EnrollmentStatus.ACTIVE) {
            throw new IllegalStateException("Only an active class can be left. Please contact the admin.");
        }
        enrollment.setStatus(EnrollmentStatus.WITHDRAWN);
        return enrollmentRepository.save(enrollment);
    }
}
