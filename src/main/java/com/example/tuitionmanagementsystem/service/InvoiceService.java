package com.example.tuitionmanagementsystem.service;

import com.example.tuitionmanagementsystem.entity.Invoice;
import com.example.tuitionmanagementsystem.entity.InvoiceStatus;
import com.example.tuitionmanagementsystem.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public List<Invoice> getAll() {
        return invoiceRepository.findAll();
    }

    public Invoice getById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
    }

    public List<Invoice> getByStudent(Long studentId) {
        return invoiceRepository.findByStudentId(studentId);
    }

    public List<Invoice> getOverdue() {
        return invoiceRepository.findOverdueInvoices();
    }

    public Invoice create(Invoice invoice) {
        if (invoice.getAmountPaid() == null) {
            invoice.setAmountPaid(BigDecimal.ZERO);
        }
        if (invoice.getStatus() == null) {
            invoice.setStatus(InvoiceStatus.UNPAID);
        }
        return invoiceRepository.save(invoice);
    }
}