package com.se2012.physicsforlife.controller;

import com.se2012.physicsforlife.entity.Enrollment;
import com.se2012.physicsforlife.entity.EnrollmentStatus;
import com.se2012.physicsforlife.service.EnrollmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    // Endpoint to enroll a student in a batch with clean error handling
    @PostMapping("/enroll")
    public ResponseEntity<?> enrollStudent(@RequestParam Long studentId, @RequestParam Long batchId) {
        try {
            Enrollment enrollment = enrollmentService.enrollStudent(studentId, batchId);
            return ResponseEntity.ok(enrollment);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Endpoint to view a specific student's enrollments
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getStudentEnrollments(studentId));
    }

    // Endpoint to update enrollment status (ACTIVE / SUSPENDED)
    @PutMapping("/{enrollmentId}/status")
    public ResponseEntity<Enrollment> updateStatus(@PathVariable Long enrollmentId, @RequestParam EnrollmentStatus status) {
        return ResponseEntity.ok(enrollmentService.updateEnrollmentStatus(enrollmentId, status));
    }

    // Endpoint to delete an enrollment record
    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<String> deleteEnrollment(@PathVariable Long enrollmentId) {
        enrollmentService.deleteEnrollment(enrollmentId);
        return ResponseEntity.ok("Enrollment deleted successfully.");
    }
}