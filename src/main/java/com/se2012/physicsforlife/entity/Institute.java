package com.se2012.physicsforlife.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "institutes")
public class Institute {

    public Long getInstituteId() {
        return instituteId;
    }

    public void setInstituteId(Long instituteId) {
        this.instituteId = instituteId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "institute_id")
    private Long instituteId;

    @Column(name = "name", nullable = false, length = 120, unique = true)
    private String name;

}