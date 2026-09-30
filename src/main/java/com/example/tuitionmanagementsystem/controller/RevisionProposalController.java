package com.example.tuitionmanagementsystem.controller;

import com.example.tuitionmanagementsystem.entity.ProposalStatus;
import com.example.tuitionmanagementsystem.entity.RevisionProposal;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/revision-proposals")
@RequiredArgsConstructor
public class RevisionProposalController {

    private final com.example.tuitionmanagementsystem.service.RevisionProposalService service;

    @GetMapping
    public List<RevisionProposal> getAll() {
        return service.getAll();
    }

    @GetMapping("/student/{studentId}")
    public List<RevisionProposal> getByStudent(@PathVariable Long studentId) {
        return service.getByStudent(studentId);
    }

    @PostMapping
    public RevisionProposal submit(@RequestBody RevisionProposal proposal) {
        return service.submit(proposal);
    }

    @PutMapping("/{id}/review")
    public RevisionProposal review(@PathVariable Long id,
                                   @RequestParam ProposalStatus decision,
                                   @RequestParam(required = false) String tutorResponse,
                                   @RequestParam Long reviewedBy) {
        return service.review(id, decision, tutorResponse, reviewedBy);
    }
}