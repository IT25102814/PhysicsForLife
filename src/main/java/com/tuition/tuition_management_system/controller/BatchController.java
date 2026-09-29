package com.tuition.tuition_management_system.controller;

import com.tuition.tuition_management_system.entity.Batch;
import com.tuition.tuition_management_system.service.BatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batches")
public class BatchController {

    private final BatchService batchService;

    public BatchController(BatchService batchService) {
        this.batchService = batchService;
    }

    // GET all batches
    @GetMapping
    public List<Batch> getAllBatches() {
        return batchService.getAllBatches();
    }

    // GET one batch by ID
    @GetMapping("/{id}")
    public ResponseEntity<Batch> getBatchById(@PathVariable Integer id) {

        return batchService.getBatchById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREATE a new batch
    @PostMapping
    public Batch createBatch(@RequestBody Batch batch) {
        return batchService.createBatch(batch);
    }

    // UPDATE an existing batch
    @PutMapping("/{id}")
    public ResponseEntity<Batch> updateBatch(
            @PathVariable Integer id,
            @RequestBody Batch batch) {

        try {
            return ResponseEntity.ok(
                    batchService.updateBatch(id, batch)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE a batch
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBatch(@PathVariable Integer id) {

        try {
            batchService.deleteBatch(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}