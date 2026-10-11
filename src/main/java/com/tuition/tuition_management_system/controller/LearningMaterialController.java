
package com.tuition.tuition_management_system.controller;

import com.tuition.tuition_management_system.entity.Batch;
import com.tuition.tuition_management_system.entity.LearningMaterial;
import com.tuition.tuition_management_system.repository.BatchRepository;
import com.tuition.tuition_management_system.service.LearningMaterialService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/learning-materials")
public class LearningMaterialController {

    private final LearningMaterialService learningMaterialService;
    private final BatchRepository batchRepository;

    public LearningMaterialController(
            LearningMaterialService learningMaterialService,
            BatchRepository batchRepository) {
        this.learningMaterialService = learningMaterialService;
        this.batchRepository = batchRepository;
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

    // Upload a real file and save its details in MySQL
    @PostMapping("/upload")
    public LearningMaterial uploadLearningMaterial(
            @RequestParam("file") MultipartFile file,
            @RequestParam("batchId") Integer batchId,
            @RequestParam("weekNumber") Short weekNumber,
            @RequestParam("title") String title,
            @RequestParam("materialType") String materialType,
            @RequestParam(value = "description", required = false)
            String description) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select a file.");
        }

        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Title is required.");
        }

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Batch not found."));

        // Store files inside the project's uploads/materials folder
        Path uploadDirectory = Paths.get("uploads", "materials")
                .toAbsolutePath().normalize();

        Files.createDirectories(uploadDirectory);

        // Generate a unique storage name to avoid overwriting files
        String originalFileName = Paths.get(file.getOriginalFilename() == null
                        ? "uploaded-file"
                        : file.getOriginalFilename())
                .getFileName().toString();

        String storedFileName = UUID.randomUUID() + "_" + originalFileName;
        Path destination = uploadDirectory.resolve(storedFileName).normalize();

        if (!destination.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid file name.");
        }

        Files.copy(file.getInputStream(), destination,
                StandardCopyOption.REPLACE_EXISTING);

        LearningMaterial material = new LearningMaterial(
                batch,
                weekNumber,
                title.trim(),
                materialType,
                description,
                originalFileName,
                storedFileName,
                file.getContentType(),
                file.getSize(),
                1L,
                LocalDateTime.now()
        );

        return learningMaterialService.createLearningMaterial(material);
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


    @GetMapping("/files/{id}")
    public ResponseEntity<Resource> viewLearningMaterialFile(
            @PathVariable Long id) {

        try {
            LearningMaterial material = learningMaterialService
                    .getLearningMaterialById(id)
                    .orElseThrow(() -> new java.io.FileNotFoundException(
                            "Learning material not found"));

            String storedFileName = material.getFilePath();

            if (storedFileName == null || storedFileName.isBlank()
                    || storedFileName.contains("/")
                    || storedFileName.contains("\\")) {
                return ResponseEntity.notFound().build();
            }

            Path uploadDirectory = Paths.get("uploads", "materials")
                    .toAbsolutePath().normalize();

            Path filePath = uploadDirectory.resolve(storedFileName).normalize();

            if (!filePath.startsWith(uploadDirectory)
                    || !Files.isRegularFile(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            String contentType = material.getMimeType();

            if (contentType == null || contentType.isBlank()) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" +
                                    material.getFileName().replace("\"", "") + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
