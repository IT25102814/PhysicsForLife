package com.se2012.physicsforlife.service;

import com.se2012.physicsforlife.entity.*;
import com.se2012.physicsforlife.repository.CourseBatchRepository;
import com.se2012.physicsforlife.repository.InvoiceRepository;
import com.se2012.physicsforlife.repository.PaymentRepository;
import com.se2012.physicsforlife.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * MEMBER 4 - Finance business logic.
 * The database triggers do the money maths: when a payment is inserted they check the amount
 * and update invoices.amount_paid and invoices.status by themselves.
 */
@Service
public class FinanceService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CourseBatchRepository batchRepository;

    public FinanceService(InvoiceRepository invoiceRepository,
                          PaymentRepository paymentRepository,
                          UserRepository userRepository,
                          CourseBatchRepository batchRepository) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.batchRepository = batchRepository;
    }

    // ---------- helpers ----------

    private String studentName(Long id) {
        return userRepository.findById(id).map(u -> u.getFullName()).orElse("Student " + id);
    }

    private String batchName(Integer id) {
        return batchRepository.findById(id).map(b -> b.getBatchName()).orElse("Batch " + id);
    }

    private Map<String, Object> invoiceRow(Invoice i) {
        Map<String, Object> row = new LinkedHashMap<>();
        BigDecimal balance = i.getAmount().subtract(i.getAmountPaid());
        row.put("invoiceId", i.getInvoiceId());
        row.put("studentId", i.getStudentId());
        row.put("studentName", studentName(i.getStudentId()));
        row.put("batchId", i.getBatchId());
        row.put("batchName", batchName(i.getBatchId()));
        row.put("billingMonth", i.getBillingMonth());
        row.put("amount", i.getAmount());
        row.put("amountPaid", i.getAmountPaid());
        row.put("balance", balance);
        row.put("dueDate", i.getDueDate());
        row.put("status", i.getStatus());
        row.put("overdue", i.getDueDate().isBefore(LocalDate.now())
                && (i.getStatus() == InvoiceStatus.UNPAID || i.getStatus() == InvoiceStatus.PARTIAL));
        return row;
    }

    private Map<String, Object> paymentRow(Payment p) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("paymentId", p.getPaymentId());
        row.put("invoiceId", p.getInvoiceId());
        row.put("amount", p.getAmount());
        row.put("method", p.getMethod());
        row.put("referenceNo", p.getReferenceNo());
        row.put("paidOn", p.getPaidOn());
        row.put("notes", p.getNotes());
        invoiceRepository.findById(p.getInvoiceId()).ifPresent(i -> {
            row.put("studentName", studentName(i.getStudentId()));
            row.put("batchName", batchName(i.getBatchId()));
            row.put("billingMonth", i.getBillingMonth());
        });
        return row;
    }

    // ---------- invoices ----------

    public List<Map<String, Object>> getAllInvoices() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Invoice i : invoiceRepository.findAllByOrderByBillingMonthDescInvoiceIdDesc()) rows.add(invoiceRow(i));
        return rows;
    }

    public List<Map<String, Object>> getInvoicesForStudent(Long studentId) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Invoice i : invoiceRepository.findByStudentIdOrderByBillingMonthDescInvoiceIdDesc(studentId)) rows.add(invoiceRow(i));
        return rows;
    }

    /** Creates one invoice for every ACTIVE student of the batch that does not have one for that month yet. */
    @Transactional
    public Map<String, Object> generateInvoices(Integer batchId, LocalDate month, Long generatedBy) {
        CourseBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new IllegalArgumentException("Batch not found."));
        AppUser generator = userRepository.findById(generatedBy)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        if (generator.getRole() != Role.TUTOR && generator.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only a tutor or admin can generate invoices.");
        }
        if (batch.getMonthlyFee() == null || batch.getMonthlyFee().signum() <= 0) {
            throw new IllegalArgumentException("This batch has no monthly fee, so no invoices are needed.");
        }

        LocalDate first = month.withDayOfMonth(1);   // the database requires the 1st of the month
        int created = 0, skipped = 0;
        for (Long studentId : invoiceRepository.findStudentIdsInBatch(batchId, EnrollmentStatus.ACTIVE)) {
            if (invoiceRepository.existsByStudentIdAndBatchIdAndBillingMonth(studentId, batchId, first)) {
                skipped++;
                continue;
            }
            Invoice inv = new Invoice();
            inv.setStudentId(studentId);
            inv.setBatchId(batchId);
            inv.setBillingMonth(first);
            inv.setAmount(batch.getMonthlyFee());
            inv.setAmountPaid(BigDecimal.ZERO);
            inv.setDueDate(first.plusDays(9));
            inv.setStatus(InvoiceStatus.UNPAID);
            inv.setGeneratedBy(generatedBy);
            invoiceRepository.save(inv);
            created++;
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("created", created);
        result.put("alreadyExisted", skipped);
        result.put("batchName", batch.getBatchName());
        result.put("billingMonth", first);
        return result;
    }

    /** One row per student who still owes money. */
    public List<Map<String, Object>> getOutstandingByStudent() {
        Map<Long, Map<String, Object>> byStudent = new LinkedHashMap<>();
        for (Invoice i : invoiceRepository.findAll()) {
            if (i.getStatus() != InvoiceStatus.UNPAID && i.getStatus() != InvoiceStatus.PARTIAL) continue;
            Map<String, Object> row = byStudent.computeIfAbsent(i.getStudentId(), id -> {
                Map<String, Object> r = new LinkedHashMap<>();
                r.put("studentId", id);
                r.put("studentName", studentName(id));
                r.put("unpaidInvoices", 0);
                r.put("totalBilled", BigDecimal.ZERO);
                r.put("totalPaid", BigDecimal.ZERO);
                r.put("outstanding", BigDecimal.ZERO);
                r.put("oldestDueDate", i.getDueDate());
                return r;
            });
            row.put("unpaidInvoices", (Integer) row.get("unpaidInvoices") + 1);
            row.put("totalBilled", ((BigDecimal) row.get("totalBilled")).add(i.getAmount()));
            row.put("totalPaid", ((BigDecimal) row.get("totalPaid")).add(i.getAmountPaid()));
            row.put("outstanding", ((BigDecimal) row.get("outstanding")).add(i.getAmount().subtract(i.getAmountPaid())));
            if (i.getDueDate().isBefore((LocalDate) row.get("oldestDueDate"))) row.put("oldestDueDate", i.getDueDate());
        }
        List<Map<String, Object>> rows = new ArrayList<>(byStudent.values());
        rows.sort((a, b) -> ((BigDecimal) b.get("outstanding")).compareTo((BigDecimal) a.get("outstanding")));
        return rows;
    }

    // ---------- payments ----------

    public List<Map<String, Object>> getAllPayments() {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Payment p : paymentRepository.findAllByOrderByPaidOnDescPaymentIdDesc()) rows.add(paymentRow(p));
        return rows;
    }

    public List<Map<String, Object>> getPaymentsForStudent(Long studentId) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Payment p : paymentRepository.findForStudent(studentId)) rows.add(paymentRow(p));
        return rows;
    }

    /** A tutor/admin records money received. The database trigger updates the invoice. */
    @Transactional
    public Payment recordPayment(Payment p) {
        if (p.getInvoiceId() == null || p.getAmount() == null || p.getRecordedBy() == null) {
            throw new IllegalArgumentException("Invoice, amount and recorded-by user are required.");
        }
        if (p.getAmount().signum() <= 0) {
            throw new IllegalArgumentException("Payment amount must be more than zero.");
        }
        Invoice invoice = invoiceRepository.findById(p.getInvoiceId())
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found."));
        AppUser recorder = userRepository.findById(p.getRecordedBy())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        if (recorder.getRole() != Role.TUTOR && recorder.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Only a tutor or admin can record a payment.");
        }
        if (invoice.getStatus() == InvoiceStatus.VOID) {
            throw new IllegalArgumentException("This invoice is void and cannot be paid.");
        }
        BigDecimal balance = invoice.getAmount().subtract(invoice.getAmountPaid());
        if (p.getAmount().compareTo(balance) > 0) {
            throw new IllegalArgumentException("Payment is more than the outstanding balance (" + balance + ").");
        }
        p.setPaymentId(null);
        if (p.getMethod() == null) p.setMethod(PaymentMethod.CASH);
        if (p.getPaidOn() == null) p.setPaidOn(LocalDate.now());
        return paymentRepository.save(p);
    }
}
