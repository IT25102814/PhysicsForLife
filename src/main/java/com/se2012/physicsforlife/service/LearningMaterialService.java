package com.se2012.physicsforlife.service;

import com.se2012.physicsforlife.entity.EnrollmentStatus;
import com.se2012.physicsforlife.entity.LearningMaterial;
import com.se2012.physicsforlife.repository.LearningMaterialRepository;
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

    // MEMBER 2 - students only see materials of the batches they are actively enrolled in
    public List<LearningMaterial> getMaterialsForStudent(Long studentId) {
        return learningMaterialRepository.findForStudent(studentId, EnrollmentStatus.ACTIVE);
    }

    public Optional<LearningMaterial> getLearningMaterialById(Long id) {
        return learningMaterialRepository.findById(id);
    }

    public LearningMaterial createLearningMaterial(LearningMaterial learningMaterial) {
        return learningMaterialRepository.save(learningMaterial);
    }

    public void deleteLearningMaterial(Long id) {
        learningMaterialRepository.deleteById(id);
    }
}