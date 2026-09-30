package com.example.tuitionmanagementsystem.repository;

import com.example.tuitionmanagementsystem.entity.ProposalStatus;
import com.example.tuitionmanagementsystem.entity.RevisionProposal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RevisionProposalRepository extends JpaRepository<RevisionProposal, Long> {
    List<RevisionProposal> findByStudentId(Long studentId);
    List<RevisionProposal> findByStatus(ProposalStatus status);
}