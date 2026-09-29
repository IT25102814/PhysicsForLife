package com.se2012.physicsforlife.service;

import com.se2012.physicsforlife.entity.AppUser;
import com.se2012.physicsforlife.entity.CourseBatch;
import com.se2012.physicsforlife.entity.Enrollment;
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

    // Injecting all three repositories to cross-reference data
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
            throw new IllegalStateException("Student is already enrolled in this batch.");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourseBatch(batch);

        return enrollmentRepository.save(enrollment);
    }

    // View all enrollments for a specific student
    public List<Enrollment> getStudentEnrollments(Long studentId) {
        AppUser student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        return enrollmentRepository.findByStudent(student);
    }
}