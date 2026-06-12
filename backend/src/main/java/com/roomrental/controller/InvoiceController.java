package com.roomrental.controller;

import com.roomrental.dto.request.InvoiceRequest;
import com.roomrental.dto.request.UtilityPriceRequest;
import com.roomrental.dto.response.InvoiceResponse;
import com.roomrental.dto.response.UtilityPriceResponse;
import com.roomrental.entity.Invoice;
import com.roomrental.service.InvoiceService;
import com.roomrental.service.UtilityPriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UtilityPriceService utilityPriceService;

    // -------- /api/invoices --------

    @GetMapping("/api/invoices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InvoiceResponse>> getAll(
            @RequestParam(required = false) Integer thang,
            @RequestParam(required = false) Integer nam,
            @RequestParam(required = false) Long phongId,
            @RequestParam(required = false) Invoice.TrangThai trangThai) {
        return ResponseEntity.ok(invoiceService.getAll(thang, nam, phongId, trangThai));
    }

    @PostMapping("/api/invoices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InvoiceResponse> create(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invoiceService.create(request));
    }

    @PutMapping("/api/invoices/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InvoiceResponse> update(@PathVariable Long id, @Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.update(id, request));
    }

    @PostMapping("/api/invoices/generate-monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InvoiceResponse>> generateMonthly(
            @RequestParam int thang,
            @RequestParam int nam) {
        return ResponseEntity.ok(invoiceService.generateMonthlyInvoices(thang, nam));
    }

    @PostMapping("/api/invoices/{id}/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> sendInvoice(@PathVariable Long id) {
        invoiceService.sendInvoice(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/invoices/send-bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> sendBulk(
            @RequestParam int thang,
            @RequestParam int nam) {
        invoiceService.sendBulkInvoices(thang, nam);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/invoices/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    @PatchMapping("/api/invoices/{id}/paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InvoiceResponse> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.markPaid(id));
    }

    // TENANT: xem hóa đơn của mình
    @GetMapping("/api/me/invoices")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<List<InvoiceResponse>> getMyInvoices(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(invoiceService.getMyInvoices(userDetails.getUsername()));
    }

    // -------- /api/utility-prices --------

    @GetMapping("/api/utility-prices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UtilityPriceResponse>> getAllPrices() {
        return ResponseEntity.ok(utilityPriceService.getAll());
    }

    @PostMapping("/api/utility-prices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UtilityPriceResponse> createPrice(
            @Valid @RequestBody UtilityPriceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(utilityPriceService.create(request));
    }
}
