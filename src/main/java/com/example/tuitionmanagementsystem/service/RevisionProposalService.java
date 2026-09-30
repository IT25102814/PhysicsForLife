package com.example.tuitionmanagementsystem.service;

import com.example.tuitionmanagementsystem.entity.ProposalStatus;
import com.example.tuitionmanagementsystem.entity.RevisionProposal;
import com.example.tuitionmanagementsystem.repository.RevisionProposalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RevisionProposalService {

    private final RevisionProposalRepository repository;

    public List<RevisionProposal> getAll() {
        return repository.findAll();
    }

    public List<RevisionProposal> getByStudent(Long studentId) {
        return repository.findByStudentId(studentId);
    }

    public RevisionProposal submit(RevisionProposal proposal) {
        proposal.setStatus(ProposalStatus.PENDING);
        return repository.save(proposal);
    }

    public RevisionProposal review(Long id, ProposalStatus decision, String tutorResponse, Long reviewedBy) {
        RevisionProposal proposal = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proposal not found: " + id));
        proposal.setStatus(decision);
        proposal.setTutorResponse(tutorResponse);
        proposal.setReviewedBy(reviewedBy);
        proposal.setReviewedAt(LocalDateTime.now());
        return repository.save(proposal);
    }
}