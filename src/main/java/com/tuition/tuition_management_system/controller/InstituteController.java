package com.tuition.tuition_management_system.controller;

import com.tuition.tuition_management_system.entity.Institute;
import com.tuition.tuition_management_system.service.InstituteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/institutes")
public class InstituteController {

    private final InstituteService instituteService;

    public InstituteController(InstituteService instituteService) {
        this.instituteService = instituteService;
    }

    // GET all institutes
    @GetMapping
    public List<Institute> getAllInstitutes() {
        return instituteService.getAllInstitutes();
    }

    // GET one institute by ID
    @GetMapping("/{id}")
    public ResponseEntity<Institute> getInstituteById(@PathVariable Integer id) {

        return instituteService.getInstituteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREATE a new institute
    @PostMapping
    public Institute createInstitute(@RequestBody Institute institute) {
        return instituteService.createInstitute(institute);
    }

    // UPDATE an existing institute
    @PutMapping("/{id}")
    public ResponseEntity<Institute> updateInstitute(
            @PathVariable Integer id,
            @RequestBody Institute institute) {

        try {
            return ResponseEntity.ok(
                    instituteService.updateInstitute(id, institute)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE an institute
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstitute(@PathVariable Integer id) {

        try {
            instituteService.deleteInstitute(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}