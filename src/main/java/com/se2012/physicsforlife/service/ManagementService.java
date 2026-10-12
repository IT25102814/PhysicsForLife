package com.se2012.physicsforlife.service;

import com.se2012.physicsforlife.entity.CourseBatch;
import com.se2012.physicsforlife.entity.Curriculum;
import com.se2012.physicsforlife.entity.Institute;
import com.se2012.physicsforlife.repository.CourseBatchRepository;
import com.se2012.physicsforlife.repository.CurriculumRepository;
import com.se2012.physicsforlife.repository.InstituteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ManagementService {

    private final InstituteRepository instituteRepo;
    private final CurriculumRepository curriculumRepo;
    private final CourseBatchRepository batchRepo;

    public ManagementService(InstituteRepository instituteRepo, CurriculumRepository curriculumRepo, CourseBatchRepository batchRepo) {
        this.instituteRepo = instituteRepo;
        this.curriculumRepo = curriculumRepo;
        this.batchRepo = batchRepo;
    }

    // Institutes
    public List<Institute> getAllInstitutes() {
        return instituteRepo.findAll();
    }
    public Institute saveInstitute(Institute institute) {
        return instituteRepo.save(institute);
    }

    // Curricula
    public List<Curriculum> getAllCurricula() {
        return curriculumRepo.findAll();
    }
    public Curriculum saveCurriculum(Curriculum curriculum) {
        return curriculumRepo.save(curriculum);
    }

    // Batches
    public List<CourseBatch> getAllBatches() {
        return batchRepo.findAll();
    }
    public CourseBatch saveBatch(CourseBatch batch) {
        return batchRepo.save(batch);
    }
}