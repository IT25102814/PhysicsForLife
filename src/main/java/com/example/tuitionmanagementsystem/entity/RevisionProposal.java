package com.example.tuitionmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class RevisionProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;

    @Enumerated(EnumType.STRING)
    private ProposalStatus status;

    private String tutorResponse;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;

}