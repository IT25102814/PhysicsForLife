package com.tuition.tuition_management_system.service;

import com.tuition.tuition_management_system.entity.Institute;
import com.tuition.tuition_management_system.repository.InstituteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InstituteService {

    private final InstituteRepository instituteRepository;

    public InstituteService(InstituteRepository instituteRepository) {
        this.instituteRepository = instituteRepository;
    }

    // Get all institutes
    public List<Institute> getAllInstitutes() {
        return instituteRepository.findAll();
    }

    // Get one institute by ID
    public Optional<Institute> getInstituteById(Integer id) {
        return instituteRepository.findById(id);
    }

    // Create a new institute
    public Institute createInstitute(Institute institute) {
        return instituteRepository.save(institute);
    }

    // Update an existing institute
    public Institute updateInstitute(Integer id, Institute instituteDetails) {

        Institute institute = instituteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Institute not found"));

        institute.setName(instituteDetails.getName());

        return instituteRepository.save(institute);
    }

    // Delete an institute
    public void deleteInstitute(Integer id) {
        instituteRepository.deleteById(id);
    }
}
