package com.example.tuitionmanagementsystem.repository;

import com.example.tuitionmanagementsystem.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByStudentId(Long studentId);

    @Query("SELECT i FROM Invoice i WHERE i.dueDate < CURRENT_DATE AND i.status <> 'PAID'")
    List<Invoice> findOverdueInvoices();
}