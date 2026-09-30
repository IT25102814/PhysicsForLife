package com.example.tuitionmanagementsystem.repository;

import com.example.tuitionmanagementsystem.entity.Payment;
import com.example.tuitionmanagementsystem.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceId(Long invoiceId);
    List<Payment> findByStatus(PaymentStatus status);
}