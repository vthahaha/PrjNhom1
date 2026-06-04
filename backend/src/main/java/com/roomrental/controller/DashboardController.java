package com.roomrental.controller;

import com.roomrental.dto.response.ContractResponse;
import com.roomrental.dto.response.DashboardOverviewResponse;
import com.roomrental.dto.response.RevenueResponse;
import com.roomrental.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<DashboardOverviewResponse> getOverview() {
        return ResponseEntity.ok(dashboardService.getOverview());
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenueResponse>> getRevenue(
            @RequestParam(required = false) Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(dashboardService.getRevenue(targetYear));
    }

    @GetMapping("/expiring-contracts")
    public ResponseEntity<List<ContractResponse>> getExpiringContracts() {
        return ResponseEntity.ok(dashboardService.getExpiringContracts());
    }

    @GetMapping("/unpaid-invoices")
    public ResponseEntity<Map<String, Object>> getUnpaidInvoices() {
        return ResponseEntity.ok(dashboardService.getUnpaidInvoices());
    }
}
