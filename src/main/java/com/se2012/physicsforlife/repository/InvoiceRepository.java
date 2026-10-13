package com.se2012.physicsforlife.repository;

import com.se2012.physicsforlife.entity.EnrollmentStatus;
import com.se2012.physicsforlife.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByStudentIdOrderByBillingMonthDescInvoiceIdDesc(Long studentId);

    List<Invoice> findAllByOrderByBillingMonthDescInvoiceIdDesc();

    boolean existsByStudentIdAndBatchIdAndBillingMonth(Long studentId, Integer batchId, LocalDate billingMonth);

    // Ids of the students who are ACTIVE in a batch (used when generating monthly invoices).
    @Query("select e.student.userId from Enrollment e where e.courseBatch.batchId = :batchId and e.status = :status")
    List<Long> findStudentIdsInBatch(@Param("batchId") Integer batchId, @Param("status") EnrollmentStatus status);
}
