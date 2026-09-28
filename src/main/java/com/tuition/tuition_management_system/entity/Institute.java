package com.tuition.tuition_management_system.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "institutes")
public class Institute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "institute_id")
    private Integer instituteId;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    // Default constructor required by JPA
    public Institute() {
    }

    // Constructor
    public Institute(String name) {
        this.name = name;
    }

    // Getter
    public Integer getInstituteId() {
        return instituteId;
    }

    // Setter
    public void setInstituteId(Integer instituteId) {
        this.instituteId = instituteId;
    }

    // Getter
    public String getName() {
        return name;
    }

    // Setter
    public void setName(String name) {
        this.name = name;
    }
}