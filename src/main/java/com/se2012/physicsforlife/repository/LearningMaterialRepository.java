package com.se2012.physicsforlife.repository;

import com.se2012.physicsforlife.entity.EnrollmentStatus;
import com.se2012.physicsforlife.entity.LearningMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, Long> {

    // Materials of ONLY the batches this student is enrolled in (with the given enrollment status)
    @Query("select m from LearningMaterial m " +
           "where m.batch.batchId in (" +
           "    select e.courseBatch.batchId from Enrollment e " +
           "    where e.student.userId = :studentId and e.status = :status) " +
           "order by m.batch.batchId, m.weekNumber, m.materialId")
    List<LearningMaterial> findForStudent(@Param("studentId") Long studentId,
                                          @Param("status") EnrollmentStatus status);
}