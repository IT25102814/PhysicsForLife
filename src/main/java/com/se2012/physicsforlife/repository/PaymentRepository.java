package com.se2012.physicsforlife.repository;

import com.se2012.physicsforlife.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByInvoiceIdOrderByPaidOnDescPaymentIdDesc(Long invoiceId);

    List<Payment> findAllByOrderByPaidOnDescPaymentIdDesc();

    @Query("select p from Payment p where p.invoiceId in (select i.invoiceId from Invoice i where i.studentId = :studentId) order by p.paidOn desc, p.paymentId desc")
    List<Payment> findForStudent(@Param("studentId") Long studentId);
}
