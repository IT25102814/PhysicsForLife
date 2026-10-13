package com.se2012.physicsforlife.controller;

import com.se2012.physicsforlife.entity.Payment;
import com.se2012.physicsforlife.service.FinanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * MEMBER 4 - Finance API.
 * Student pages use /student/** URLs. Tutor/admin pages use the others (role checks come in the security step).
 */
@RestController
@RequestMapping("/api")
public class FinanceController {

    private final FinanceService financeService;

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    // ----- invoices -----

    @GetMapping("/invoices")
    public List<Map<String, Object>> allInvoices() {
        return financeService.getAllInvoices();
    }

    @GetMapping("/invoices/student/{studentId}")
    public List<Map<String, Object>> studentInvoices(@PathVariable Long studentId) {
        return financeService.getInvoicesForStudent(studentId);
    }

    @GetMapping("/invoices/outstanding")
    public List<Map<String, Object>> outstanding() {
        return financeService.getOutstandingByStudent();
    }

    // month example: 2026-10-01
    @PostMapping("/invoices/generate")
    public ResponseEntity<?> generate(@RequestParam Integer batchId,
                                      @RequestParam String month,
                                      @RequestParam Long generatedBy) {
        try {
            return ResponseEntity.ok(financeService.generateInvoices(batchId, LocalDate.parse(month), generatedBy));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DATABASE ERROR: " + rootMessage(e));
        }
    }

    // ----- payments -----

    @GetMapping("/payments")
    public List<Map<String, Object>> allPayments() {
        return financeService.getAllPayments();
    }

    @GetMapping("/payments/student/{studentId}")
    public List<Map<String, Object>> studentPayments(@PathVariable Long studentId) {
        return financeService.getPaymentsForStudent(studentId);
    }

    @PostMapping("/payments")
    public ResponseEntity<?> recordPayment(@RequestBody Payment payment) {
        try {
            return ResponseEntity.ok(financeService.recordPayment(payment));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("DATABASE ERROR: " + rootMessage(e));
        }
    }

    private String rootMessage(Throwable e) {
        Throwable t = e;
        while (t.getCause() != null) t = t.getCause();
        return t.getMessage();
    }
}
