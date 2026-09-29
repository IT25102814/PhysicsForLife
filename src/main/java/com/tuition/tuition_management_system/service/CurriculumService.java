package com.tuition.tuition_management_system.service;

import com.tuition.tuition_management_system.entity.Curriculum;
import com.tuition.tuition_management_system.repository.CurriculumRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CurriculumService {

    private final CurriculumRepository curriculumRepository;

    public CurriculumService(CurriculumRepository curriculumRepository) {
        this.curriculumRepository = curriculumRepository;
    }

    // Get all curricula
    public List<Curriculum> getAllCurricula() {
        return curriculumRepository.findAll();
    }

    // Get one curriculum by ID
    public Optional<Curriculum> getCurriculumById(Integer id) {
        return curriculumRepository.findById(id);
    }

    // Create a new curriculum
    public Curriculum createCurriculum(Curriculum curriculum) {
        return curriculumRepository.save(curriculum);
    }

    // Update an existing curriculum
    public Curriculum updateCurriculum(Integer id, Curriculum curriculumDetails) {

        Curriculum curriculum = curriculumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Curriculum not found"));

        curriculum.setName(curriculumDetails.getName());

        return curriculumRepository.save(curriculum);
    }

    // Delete a curriculum
    public void deleteCurriculum(Integer id) {
        curriculumRepository.deleteById(id);
    }
}