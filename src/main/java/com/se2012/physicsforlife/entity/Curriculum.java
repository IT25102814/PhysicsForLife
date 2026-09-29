package com.se2012.physicsforlife.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "curricula")
public class Curriculum {

    public Long getCurriculumId() {
        return curriculumId;
    }

    public void setCurriculumId(Long curriculumId) {
        this.curriculumId = curriculumId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "curriculum_id")
    private Long curriculumId;

    @Column(name = "name", nullable = false, length = 100, unique = true)
    private String name;

}