package com.se2012.physicsforlife.controller;

import com.se2012.physicsforlife.entity.Enrollment;
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

    // Endpoint to enroll a student in a batch using their IDs
    @PostMapping("/enroll")
    public ResponseEntity<Enrollment> enrollStudent(@RequestParam Long studentId, @RequestParam Long batchId) {
        return ResponseEntity.ok(enrollmentService.enrollStudent(studentId, batchId));
    }

    // Endpoint to view a specific student's enrollments
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getStudentEnrollments(studentId));
    }
}