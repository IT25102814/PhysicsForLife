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

    @PutMapping("/institutes/{id}")
    public ResponseEntity<Institute> updateInstitute(@PathVariable Long id, @RequestBody Institute institute) {
        return ResponseEntity.ok(managementService.updateInstitute(id, institute));
    }

    @DeleteMapping("/institutes/{id}")
    public ResponseEntity<Void> deleteInstitute(@PathVariable Long id) {
        managementService.deleteInstitute(id);
        return ResponseEntity.noContent().build();
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

    @PutMapping("/curricula/{id}")
    public ResponseEntity<Curriculum> updateCurriculum(@PathVariable Long id, @RequestBody Curriculum curriculum) {
        return ResponseEntity.ok(managementService.updateCurriculum(id, curriculum));
    }

    @DeleteMapping("/curricula/{id}")
    public ResponseEntity<Void> deleteCurriculum(@PathVariable Long id) {
        managementService.deleteCurriculum(id);
        return ResponseEntity.noContent().build();
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

    @PutMapping("/batches/{id}")
    public ResponseEntity<CourseBatch> updateBatch(@PathVariable Integer id, @RequestBody CourseBatch batch) {
        return ResponseEntity.ok(managementService.updateBatch(id, batch));
    }

    @DeleteMapping("/batches/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable Integer id) {
        managementService.deleteBatch(id);
        return ResponseEntity.noContent().build();
    }
}