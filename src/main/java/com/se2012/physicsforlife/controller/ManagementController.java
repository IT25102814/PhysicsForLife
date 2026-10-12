package com.se2012.physicsforlife.controller;

import com.se2012.physicsforlife.entity.CourseBatch;
import com.se2012.physicsforlife.entity.Curriculum;
import com.se2012.physicsforlife.entity.Institute;
import com.se2012.physicsforlife.service.ManagementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/management")
public class ManagementController {

    private final ManagementService managementService;

    public ManagementController(ManagementService managementService) {
        this.managementService = managementService;
    }

    // --- INSTITUTES ---
    @GetMapping("/institutes")
    public ResponseEntity<List<Institute>> getInstitutes() {
        return ResponseEntity.ok(managementService.getAllInstitutes());
    }

    @PostMapping("/institutes")
    public ResponseEntity<Institute> createInstitute(@RequestBody Institute institute) {
        return ResponseEntity.ok(managementService.saveInstitute(institute));
    }

    // --- CURRICULA ---
    @GetMapping("/curricula")
    public ResponseEntity<List<Curriculum>> getCurricula() {
        return ResponseEntity.ok(managementService.getAllCurricula());
    }

    @PostMapping("/curricula")
    public ResponseEntity<Curriculum> createCurriculum(@RequestBody Curriculum curriculum) {
        return ResponseEntity.ok(managementService.saveCurriculum(curriculum));
    }

    // --- BATCHES ---
    @GetMapping("/batches")
    public ResponseEntity<List<CourseBatch>> getBatches() {
        return ResponseEntity.ok(managementService.getAllBatches());
    }

    @PostMapping("/batches")
    public ResponseEntity<CourseBatch> createBatch(@RequestBody CourseBatch batch) {
        return ResponseEntity.ok(managementService.saveBatch(batch));
    }
}