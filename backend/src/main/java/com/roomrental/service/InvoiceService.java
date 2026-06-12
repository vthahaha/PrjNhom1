package com.roomrental.service;

import com.roomrental.dto.request.InvoiceRequest;
import com.roomrental.dto.response.InvoiceResponse;
import com.roomrental.entity.Invoice;

import java.util.List;

public interface InvoiceService {
    List<InvoiceResponse> getAll(Integer thang, Integer nam, Long phongId, Invoice.TrangThai trangThai);
    InvoiceResponse create(InvoiceRequest request);
    InvoiceResponse update(Long id, InvoiceRequest request);
    InvoiceResponse getById(Long id);
    InvoiceResponse markPaid(Long id);
    List<InvoiceResponse> getMyInvoices(String soDienThoai);
    List<InvoiceResponse> generateMonthlyInvoices(int thang, int nam);
    void sendInvoice(Long id);
    void sendBulkInvoices(int thang, int nam);
}
