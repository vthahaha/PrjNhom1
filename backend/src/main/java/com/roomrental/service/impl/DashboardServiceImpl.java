package com.roomrental.service.impl;

import com.roomrental.dto.response.ContractResponse;
import com.roomrental.dto.response.DashboardOverviewResponse;
import com.roomrental.dto.response.RevenueResponse;
import com.roomrental.entity.Contract;
import com.roomrental.entity.Invoice;
import com.roomrental.entity.Room;
import com.roomrental.repository.ContractRepository;
import com.roomrental.repository.InvoiceRepository;
import com.roomrental.repository.RoomRepository;
import com.roomrental.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final RoomRepository roomRepository;
    private final ContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;

    @Override
    public DashboardOverviewResponse getOverview() {
        long trong     = roomRepository.countByTrangThai(Room.TrangThai.TRONG);
        long daThue    = roomRepository.countByTrangThai(Room.TrangThai.DA_THUE);
        long dangSua   = roomRepository.countByTrangThai(Room.TrangThai.DANG_SUA);
        long tongPhong = roomRepository.count();
        long hdHieuLuc = contractRepository.findByTrangThai(Contract.TrangThai.HIEU_LUC).size();
        long chuaTT    = invoiceRepository.countByTrangThai(Invoice.TrangThai.CHUA_TT);
        BigDecimal tongChuaTT = invoiceRepository.sumUnpaidAmount();
        return new DashboardOverviewResponse(trong, daThue, dangSua, tongPhong,
                hdHieuLuc, chuaTT, tongChuaTT != null ? tongChuaTT : BigDecimal.ZERO);
    }

    @Override
    public List<RevenueResponse> getRevenue(int year) {
        return invoiceRepository.revenueByMonth(year).stream()
                .map(row -> new RevenueResponse(
                        ((Number) row[0]).intValue(),
                        (BigDecimal) row[1]))
                .toList();
    }

    @Override
    public List<ContractResponse> getExpiringContracts() {
        LocalDate today = LocalDate.now();
        LocalDate in30  = today.plusDays(30);
        return contractRepository.findExpiringSoon(today, in30)
                .stream().map(this::toContractResponse).toList();
    }

    @Override
    public Map<String, Object> getUnpaidInvoices() {
        long count = invoiceRepository.countByTrangThai(Invoice.TrangThai.CHUA_TT);
        BigDecimal total = invoiceRepository.sumUnpaidAmount();
        Map<String, Object> result = new HashMap<>();
        result.put("soHoaDon", count);
        result.put("tongTien", total != null ? total : BigDecimal.ZERO);
        return result;
    }

    // -------- helpers --------

    private ContractResponse toContractResponse(com.roomrental.entity.Contract c) {
        return new ContractResponse(
                c.getId(),
                c.getRoom().getId(), c.getRoom().getTenPhong(),
                c.getKhachThue().getId(), c.getKhachThue().getHoTen(), c.getKhachThue().getSoDienThoai(),
                c.getNgayBatDau(), c.getNgayKetThuc(),
                c.getGiaThue(), c.getTienCoc(),
                c.getTrangThai(), c.getLyDoChamDut(), c.getNgayTraPhong(),
                c.getCreatedAt());
    }
}
