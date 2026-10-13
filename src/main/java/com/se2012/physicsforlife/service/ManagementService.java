package com.se2012.physicsforlife.service;

import com.se2012.physicsforlife.entity.CourseBatch;
import com.se2012.physicsforlife.entity.Curriculum;
import com.se2012.physicsforlife.entity.ExamLevel;
import com.se2012.physicsforlife.entity.Institute;
import com.se2012.physicsforlife.entity.SyllabusType;
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
    public List<Institute> getAllInstitutes() { return instituteRepo.findAll(); }
    public Institute saveInstitute(Institute institute) { return instituteRepo.save(institute); }
    public Institute updateInstitute(Long id, Institute details) {
        Institute institute = instituteRepo.findById(id).orElseThrow(() -> new RuntimeException("Institute not found"));
        institute.setName(details.getName());
        return instituteRepo.save(institute);
    }
    public void deleteInstitute(Long id) { instituteRepo.deleteById(id); }

    // Curricula
    public List<Curriculum> getAllCurricula() { return curriculumRepo.findAll(); }
    public Curriculum saveCurriculum(Curriculum curriculum) { return curriculumRepo.save(curriculum); }
    public Curriculum updateCurriculum(Long id, Curriculum details) {
        Curriculum curriculum = curriculumRepo.findById(id).orElseThrow(() -> new RuntimeException("Curriculum not found"));
        curriculum.setName(details.getName());
        return curriculumRepo.save(curriculum);
    }
    public void deleteCurriculum(Long id) { curriculumRepo.deleteById(id); }

    // Batches
    public List<CourseBatch> getAllBatches() { return batchRepo.findAll(); }

    public CourseBatch saveBatch(CourseBatch batch) {
        // The database requires these columns, so never save a batch without them.
        if (batch.getSyllabusType() == null) batch.setSyllabusType(SyllabusType.LOCAL);
        if (batch.getExamLevel() == null) batch.setExamLevel(ExamLevel.A_LEVEL);
        if (batch.getInstitute() != null && batch.getInstitute().getInstituteId() != null) {
            Institute inst = instituteRepo.findById(batch.getInstitute().getInstituteId())
                    .orElseThrow(() -> new RuntimeException("Institute not found"));
            batch.setInstitute(inst);
        }
        if (batch.getCurriculum() != null && batch.getCurriculum().getCurriculumId() != null) {
            Curriculum curr = curriculumRepo.findById(batch.getCurriculum().getCurriculumId())
                    .orElseThrow(() -> new RuntimeException("Curriculum not found"));
            batch.setCurriculum(curr);
        }
        return batchRepo.save(batch);
    }

    public CourseBatch updateBatch(Integer id, CourseBatch details) {
        CourseBatch batch = batchRepo.findById(id).orElseThrow(() -> new RuntimeException("Batch not found"));
        batch.setBatchName(details.getBatchName());
        batch.setBatchYear(details.getBatchYear());
        batch.setMonthlyFee(details.getMonthlyFee());

        if (details.getSyllabusType() != null) batch.setSyllabusType(details.getSyllabusType());
        if (details.getExamLevel() != null) batch.setExamLevel(details.getExamLevel());

        if (details.getInstitute() != null && details.getInstitute().getInstituteId() != null) {
            Institute inst = instituteRepo.findById(details.getInstitute().getInstituteId())
                    .orElseThrow(() -> new RuntimeException("Institute not found"));
            batch.setInstitute(inst);
        }
        if (details.getCurriculum() != null && details.getCurriculum().getCurriculumId() != null) {
            Curriculum curr = curriculumRepo.findById(details.getCurriculum().getCurriculumId())
                    .orElseThrow(() -> new RuntimeException("Curriculum not found"));
            batch.setCurriculum(curr);
        }
        return batchRepo.save(batch);
    }

    public void deleteBatch(Integer id) { batchRepo.deleteById(id); }
}