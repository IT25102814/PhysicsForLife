package com.example.tuitionmanagementsystem.service;

import com.example.tuitionmanagementsystem.entity.*;
import com.example.tuitionmanagementsystem.repository.InvoiceRepository;
import com.example.tuitionmanagementsystem.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public List<Payment> getByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId);
    }

    public List<Payment> getPendingVerification() {
        return paymentRepository.findByStatus(PaymentStatus.PENDING_VERIFICATION);
    }

    public Payment uploadReceipt(Payment payment) {
        payment.setStatus(PaymentStatus.PENDING_VERIFICATION);
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment verifyPayment(Long paymentId, Long verifiedBy) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        if (payment.getStatus() != PaymentStatus.PENDING_VERIFICATION) {
            throw new IllegalStateException("Only pending payments can be verified");
        }

        payment.setStatus(PaymentStatus.VERIFIED);
        payment.setVerifiedBy(verifiedBy);
        payment.setVerifiedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Invoice invoice = invoiceRepository.findById(payment.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + payment.getInvoiceId()));

        BigDecimal newTotal = invoice.getAmountPaid().add(payment.getAmount());
        invoice.setAmountPaid(newTotal);
        invoice.setStatus(newTotal.compareTo(invoice.getAmount()) >= 0
                ? InvoiceStatus.PAID
                : InvoiceStatus.PARTIAL);
        invoiceRepository.save(invoice);

        return payment;
    }

    public Payment rejectPayment(Long paymentId, Long verifiedBy, String notes) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

        payment.setStatus(PaymentStatus.REJECTED);
        payment.setVerifiedBy(verifiedBy);
        payment.setVerifiedAt(LocalDateTime.now());
        payment.setNotes(notes);
        return paymentRepository.save(payment);
    }
}