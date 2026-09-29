package com.tuition.tuition_management_system.service;

import com.tuition.tuition_management_system.entity.LearningMaterial;
import com.tuition.tuition_management_system.repository.LearningMaterialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LearningMaterialService {

    private final LearningMaterialRepository learningMaterialRepository;

    public LearningMaterialService(LearningMaterialRepository learningMaterialRepository) {
        this.learningMaterialRepository = learningMaterialRepository;
    }

    public List<LearningMaterial> getAllLearningMaterials() {
        return learningMaterialRepository.findAll();
    }

    public Optional<LearningMaterial> getLearningMaterialById(Long id) {
        return learningMaterialRepository.findById(id);
    }

    public LearningMaterial createLearningMaterial(LearningMaterial learningMaterial) {
        return learningMaterialRepository.save(learningMaterial);
    }

    public LearningMaterial updateLearningMaterial(
            Long id,
            LearningMaterial learningMaterialDetails) {

        LearningMaterial learningMaterial =
                learningMaterialRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Learning material not found"));

        learningMaterial.setBatch(learningMaterialDetails.getBatch());
        learningMaterial.setWeekNumber(learningMaterialDetails.getWeekNumber());
        learningMaterial.setTitle(learningMaterialDetails.getTitle());
        learningMaterial.setMaterialType(learningMaterialDetails.getMaterialType());
        learningMaterial.setDescription(learningMaterialDetails.getDescription());
        learningMaterial.setFileName(learningMaterialDetails.getFileName());
        learningMaterial.setFilePath(learningMaterialDetails.getFilePath());
        learningMaterial.setMimeType(learningMaterialDetails.getMimeType());
        learningMaterial.setFileSizeBytes(learningMaterialDetails.getFileSizeBytes());
        learningMaterial.setUploadedBy(learningMaterialDetails.getUploadedBy());
        learningMaterial.setCreatedAt(learningMaterialDetails.getCreatedAt());

        return learningMaterialRepository.save(learningMaterial);
    }

    public void deleteLearningMaterial(Long id) {
        learningMaterialRepository.deleteById(id);
    }
}