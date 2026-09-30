package com.example.tuitionmanagementsystem.controller;

import com.example.tuitionmanagementsystem.entity.Payment;
import com.example.tuitionmanagementsystem.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/invoice/{invoiceId}")
    public List<Payment> getByInvoice(@PathVariable Long invoiceId) {
        return paymentService.getByInvoice(invoiceId);
    }

    @GetMapping("/pending")
    public List<Payment> getPendingVerification() {
        return paymentService.getPendingVerification();
    }

    @PostMapping
    public Payment uploadReceipt(@RequestBody Payment payment) {
        return paymentService.uploadReceipt(payment);
    }

    @PutMapping("/{id}/verify")
    public Payment verify(@PathVariable Long id, @RequestParam Long verifiedBy) {
        return paymentService.verifyPayment(id, verifiedBy);
    }

    @PutMapping("/{id}/reject")
    public Payment reject(@PathVariable Long id, @RequestParam Long verifiedBy,
                          @RequestParam(required = false) String notes) {
        return paymentService.rejectPayment(id, verifiedBy, notes);
    }
}