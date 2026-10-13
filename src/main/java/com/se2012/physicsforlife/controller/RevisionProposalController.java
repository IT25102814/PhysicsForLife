package com.se2012.physicsforlife.controller;

import com.se2012.physicsforlife.entity.ProposalStatus;
import com.se2012.physicsforlife.entity.RevisionProposal;
import com.se2012.physicsforlife.service.RevisionProposalService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/revision-proposals")
public class RevisionProposalController {

    private final RevisionProposalService service;

    public RevisionProposalController(RevisionProposalService service) {
        this.service = service;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return service.getAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Map<String, Object>> getByStudent(@PathVariable Long studentId) {
        return service.getByStudent(studentId);
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody RevisionProposal proposal) {
        try {
            return ResponseEntity.ok(service.submit(proposal));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DATABASE ERROR: " + rootMessage(e));
        }
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<?> review(@PathVariable Long id,
                                    @RequestParam ProposalStatus decision,
                                    @RequestParam(required = false) String tutorResponse,
                                    @RequestParam Long reviewedBy) {
        try {
            return ResponseEntity.ok(service.review(id, decision, tutorResponse, reviewedBy));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DATABASE ERROR: " + rootMessage(e));
        }
    }

    private String rootMessage(Throwable e) {
        Throwable t = e;
        while (t.getCause() != null) t = t.getCause();
        return t.getMessage();
    }
}
