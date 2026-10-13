package com.se2012.physicsforlife.service;

import com.se2012.physicsforlife.entity.*;
import com.se2012.physicsforlife.repository.CourseBatchRepository;
import com.se2012.physicsforlife.repository.EnrollmentRepository;
import com.se2012.physicsforlife.repository.RevisionProposalRepository;
import com.se2012.physicsforlife.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/** MEMBER 4 - revision class requests from students, answered by tutors/admins. */
@Service
public class RevisionProposalService {

    private final RevisionProposalRepository repository;
    private final UserRepository userRepository;
    private final CourseBatchRepository batchRepository;
    private final EnrollmentRepository enrollmentRepository;

    public RevisionProposalService(RevisionProposalRepository repository,
                                   UserRepository userRepository,
                                   CourseBatchRepository batchRepository,
                                   EnrollmentRepository enrollmentRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.batchRepository = batchRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    private Map<String, Object> row(RevisionProposal p) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("proposalId", p.getProposalId());
        r.put("studentId", p.getStudentId());
        r.put("studentName", userRepository.findById(p.getStudentId()).map(u -> u.getFullName()).orElse("Student " + p.getStudentId()));
        r.put("batchId", p.getBatchId());
        r.put("batchName", batchRepository.findById(p.getBatchId()).map(b -> b.getBatchName()).orElse("Batch " + p.getBatchId()));
        r.put("topic", p.getTopic());
        r.put("reason", p.getReason());
        r.put("preferredDate", p.getPreferredDate());
        r.put("status", p.getStatus());
        r.put("tutorResponse", p.getTutorResponse());
        r.put("createdAt", p.getCreatedAt());
        r.put("reviewedAt", p.getReviewedAt());
        return r;
    }

    public List<Map<String, Object>> getAll() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (RevisionProposal p : repository.findAllByOrderByProposalIdDesc()) rows.add(row(p));
        return rows;
    }

    public List<Map<String, Object>> getByStudent(Long studentId) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (RevisionProposal p : repository.findByStudentIdOrderByProposalIdDesc(studentId)) rows.add(row(p));
        return rows;
    }

    public RevisionProposal submit(RevisionProposal proposal) {
        if (proposal.getStudentId() == null || proposal.getBatchId() == null) {
            throw new IllegalArgumentException("Student and class are required.");
        }
        if (proposal.getTopic() == null || proposal.getTopic().trim().isEmpty()) {
            throw new IllegalArgumentException("Please enter a topic.");
        }
        AppUser student = userRepository.findById(proposal.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));
        boolean enrolled = enrollmentRepository.findByStudent(student).stream()
                .anyMatch(e -> e.getStatus() == EnrollmentStatus.ACTIVE
                        && e.getCourseBatch().getBatchId().equals(proposal.getBatchId()));
        if (!enrolled) {
            throw new IllegalArgumentException("You can only request a revision for a class you are enrolled in.");
        }
        proposal.setProposalId(null);
        proposal.setStatus(ProposalStatus.PENDING);
        proposal.setTutorResponse(null);
        proposal.setReviewedBy(null);
        proposal.setReviewedAt(null);
        return repository.save(proposal);
    }

    public RevisionProposal review(Long id, ProposalStatus decision, String tutorResponse, Long reviewedBy) {
        RevisionProposal proposal = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found."));
        AppUser reviewer = userRepository.findById(reviewedBy)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        if (reviewer.getRole() != Role.TUTOR && reviewer.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only a tutor or admin can answer a request.");
        }
        if (decision == ProposalStatus.PENDING) {
            throw new IllegalArgumentException("Choose Accepted, Scheduled or Declined.");
        }
        proposal.setStatus(decision);
        proposal.setTutorResponse(tutorResponse);
        proposal.setReviewedBy(reviewedBy);
        proposal.setReviewedAt(LocalDateTime.now());
        return repository.save(proposal);
    }
}
