package com.physicsforlife.assessmentengine.entity;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "assessment")
public class Assessment {
    public int getAssessment_id() {
        return assessment_id;
    }

    public void setAssessment_id(int assessment_id) {
        this.assessment_id = assessment_id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getCreate_date() {
        return create_date;
    }

    public void setCreate_date(Date create_date) {
        this.create_date = create_date;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int assessment_id;

    private String title;
    private String description;
    private Date create_date;

    // Generate Getters and Setters here
}