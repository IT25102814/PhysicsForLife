package com.se2012.physicsforlife.repository;

import com.se2012.physicsforlife.entity.RevisionProposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RevisionProposalRepository extends JpaRepository<RevisionProposal, Long> {

    List<RevisionProposal> findByStudentIdOrderByProposalIdDesc(Long studentId);

    List<RevisionProposal> findAllByOrderByProposalIdDesc();
}
