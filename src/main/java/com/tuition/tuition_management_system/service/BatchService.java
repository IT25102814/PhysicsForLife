package com.tuition.tuition_management_system.service;

import com.tuition.tuition_management_system.entity.Batch;
import com.tuition.tuition_management_system.repository.BatchRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BatchService {

    private final BatchRepository batchRepository;

    public BatchService(BatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    // Get all batches
    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    // Get one batch by ID
    public Optional<Batch> getBatchById(Integer id) {
        return batchRepository.findById(id);
    }

    // Create a new batch
    public Batch createBatch(Batch batch) {
        return batchRepository.save(batch);
    }

    // Update an existing batch
    public Batch updateBatch(Integer id, Batch batchDetails) {

        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        batch.setInstitute(batchDetails.getInstitute());
        batch.setCurriculum(batchDetails.getCurriculum());
        batch.setBatchName(batchDetails.getBatchName());
        batch.setMonthlyFee(batchDetails.getMonthlyFee());
        batch.setActive(batchDetails.getActive());

        return batchRepository.save(batch);
    }

    // Delete a batch
    public void deleteBatch(Integer id) {
        batchRepository.deleteById(id);
    }
}