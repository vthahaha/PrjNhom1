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
import com.roomrental.repository.RepairRequestRepository;
import com.roomrental.service.DashboardService;
import com.roomrental.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final RoomRepository roomRepository;
    private final ContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;
    private final RepairRequestRepository repairRequestRepository;
    private final FileStorageService fileStorageService;

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
                        new BigDecimal(row[1].toString())))
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

    @Override
    public Map<String, BigDecimal> getFinanceStats(String startDate, String endDate) {
        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate) : LocalDateTime.now().minusYears(10);
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate) : LocalDateTime.now().plusYears(10);
        
        Number tongThuRaw = invoiceRepository.sumPaidAmountByDateRange(start, end);
        BigDecimal tongThu = tongThuRaw != null ? new BigDecimal(tongThuRaw.toString()) : BigDecimal.ZERO;
        
        Number tongChiRaw = repairRequestRepository.sumChiPhiByDateRange(start, end);
        BigDecimal tongChi = tongChiRaw != null ? new BigDecimal(tongChiRaw.toString()) : BigDecimal.ZERO;
        
        Map<String, BigDecimal> result = new HashMap<>();
        result.put("tongThu", tongThu);
        result.put("tongChi", tongChi);
        return result;
    }

    // -------- helpers --------

    private ContractResponse toContractResponse(com.roomrental.entity.Contract c) {
        java.util.List<ContractResponse.DichVuInfo> dichVuInfos = c.getDichVu() == null ? java.util.List.of() :
            c.getDichVu().stream()
                .map(s -> new ContractResponse.DichVuInfo(s.getId(), s.getTenDichVu(), s.getDonGiaMacDinh(), s.getDonVi()))
                .toList();
        return new ContractResponse(
                c.getId(),
                c.getRoom().getId(), c.getRoom().getTenPhong(),
                c.getKhachThue().getId(), c.getKhachThue().getHoTen(), c.getKhachThue().getSoDienThoai(),
                c.getNgayBatDau(), c.getNgayKetThuc(),
                c.getGiaThue(), c.getTienCoc(),
                c.getTrangThai(), c.getSoNguoiO(), c.getLyDoChamDut(), c.getNgayTraPhong(),
                c.getCreatedAt(), c.getRoom().getTienNghi(),
                fileStorageService.getPresignedUrl(c.getFileHopDongUrl()),
                c.getKyDongTien(),
                dichVuInfos);
    }
}
