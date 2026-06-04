package com.roomrental.service;

import com.roomrental.dto.response.ContractResponse;
import com.roomrental.dto.response.DashboardOverviewResponse;
import com.roomrental.dto.response.RevenueResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface DashboardService {
    DashboardOverviewResponse getOverview();
    List<RevenueResponse> getRevenue(int year);
    List<ContractResponse> getExpiringContracts();
    Map<String, Object> getUnpaidInvoices();
}
