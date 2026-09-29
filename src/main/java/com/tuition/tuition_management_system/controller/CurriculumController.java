package com.tuition.tuition_management_system.controller;

import com.tuition.tuition_management_system.entity.Curriculum;
import com.tuition.tuition_management_system.service.CurriculumService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/curricula")
public class CurriculumController {

    private final CurriculumService curriculumService;

    public CurriculumController(CurriculumService curriculumService) {
        this.curriculumService = curriculumService;
    }

    // GET all curricula
    @GetMapping
    public List<Curriculum> getAllCurricula() {
        return curriculumService.getAllCurricula();
    }

    // GET one curriculum by ID
    @GetMapping("/{id}")
    public ResponseEntity<Curriculum> getCurriculumById(@PathVariable Integer id) {

        return curriculumService.getCurriculumById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREATE a new curriculum
    @PostMapping
    public Curriculum createCurriculum(@RequestBody Curriculum curriculum) {
        return curriculumService.createCurriculum(curriculum);
    }

    // UPDATE an existing curriculum
    @PutMapping("/{id}")
    public ResponseEntity<Curriculum> updateCurriculum(
            @PathVariable Integer id,
            @RequestBody Curriculum curriculum) {

        try {
            return ResponseEntity.ok(
                    curriculumService.updateCurriculum(id, curriculum)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE a curriculum
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCurriculum(@PathVariable Integer id) {

        try {
            curriculumService.deleteCurriculum(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}