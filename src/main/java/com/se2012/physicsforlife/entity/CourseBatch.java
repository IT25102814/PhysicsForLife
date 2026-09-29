package com.se2012.physicsforlife.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "batches")
public class CourseBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "batch_id")
    private Long batchId;

    @Column(name = "batch_year", nullable = false)
    private Integer batchYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "syllabus_type", nullable = false)
    private SyllabusType syllabusType;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_level", nullable = false)
    private ExamLevel examLevel;

    @Column(name = "monthly_fee", nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyFee;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public Integer getBatchYear() {
        return batchYear;
    }

    public void setBatchYear(Integer batchYear) {
        this.batchYear = batchYear;
    }

    public SyllabusType getSyllabusType() {
        return syllabusType;
    }

    public void setSyllabusType(SyllabusType syllabusType) {
        this.syllabusType = syllabusType;
    }

    public ExamLevel getExamLevel() {
        return examLevel;
    }

    public void setExamLevel(ExamLevel examLevel) {
        this.examLevel = examLevel;
    }

    public BigDecimal getMonthlyFee() {
        return monthlyFee;
    }

    public void setMonthlyFee(BigDecimal monthlyFee) {
        this.monthlyFee = monthlyFee;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    public Institute getInstitute() {
        return institute;
    }

    public void setInstitute(Institute institute) {
        this.institute = institute;
    }

    public Curriculum getCurriculum() {
        return curriculum;
    }

    public void setCurriculum(Curriculum curriculum) {
        this.curriculum = curriculum;
    }
// --- FOREIGN KEYS (The Links to Your Other Tables) ---

    @ManyToOne
    @JoinColumn(name = "institute_id", nullable = false)
    private Institute institute;

    @ManyToOne
    @JoinColumn(name = "curriculum_id", nullable = false)
    private Curriculum curriculum;

}