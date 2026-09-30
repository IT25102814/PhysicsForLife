package com.example.tuitionmanagementsystem.controller;

import com.example.tuitionmanagementsystem.entity.Invoice;
import com.example.tuitionmanagementsystem.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    public List<Invoice> getAll() {
        return invoiceService.getAll();
    }

    @GetMapping("/{id}")
    public Invoice getById(@PathVariable Long id) {
        return invoiceService.getById(id);
    }

    @GetMapping("/student/{studentId}")
    public List<Invoice> getByStudent(@PathVariable Long studentId) {
        return invoiceService.getByStudent(studentId);
    }

    @GetMapping("/overdue")
    public List<Invoice> getOverdue() {
        return invoiceService.getOverdue();
    }

    @PostMapping
    public Invoice create(@RequestBody Invoice invoice) {
        return invoiceService.create(invoice);
    }
}