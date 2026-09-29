package com.tuition.tuition_management_system.controller;

import com.tuition.tuition_management_system.entity.LearningMaterial;
import com.tuition.tuition_management_system.service.LearningMaterialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-materials")
public class LearningMaterialController {

    private final LearningMaterialService learningMaterialService;

    public LearningMaterialController(
            LearningMaterialService learningMaterialService) {
        this.learningMaterialService = learningMaterialService;
    }

    @GetMapping
    public List<LearningMaterial> getAllLearningMaterials() {
        return learningMaterialService.getAllLearningMaterials();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningMaterial> getLearningMaterialById(
            @PathVariable Long id) {

        return learningMaterialService.getLearningMaterialById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public LearningMaterial createLearningMaterial(
            @RequestBody LearningMaterial learningMaterial) {

        return learningMaterialService.createLearningMaterial(learningMaterial);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningMaterial> updateLearningMaterial(
            @PathVariable Long id,
            @RequestBody LearningMaterial learningMaterial) {

        try {
            return ResponseEntity.ok(
                    learningMaterialService.updateLearningMaterial(
                            id, learningMaterial)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningMaterial(
            @PathVariable Long id) {

        try {
            learningMaterialService.deleteLearningMaterial(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}