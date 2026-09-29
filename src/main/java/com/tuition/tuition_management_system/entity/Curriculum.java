package com.tuition.tuition_management_system.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "curricula")
public class Curriculum {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "curriculum_id")
    private Integer curriculumId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    public Curriculum() {
    }

    public Curriculum(String name) {
        this.name = name;
    }

    public Integer getCurriculumId() {
        return curriculumId;
    }

    public void setCurriculumId(Integer curriculumId) {
        this.curriculumId = curriculumId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}