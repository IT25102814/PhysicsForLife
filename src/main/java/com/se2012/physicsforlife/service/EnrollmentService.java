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

    // Core Member 1 function: Enroll a student into a batch
    public Enrollment enrollStudent(Long studentId, Long batchId) {
        AppUser student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        CourseBatch batch = courseBatchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Course batch not found."));

        if (enrollmentRepository.findByStudentAndCourseBatch(student, batch).isPresent()) {
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
}