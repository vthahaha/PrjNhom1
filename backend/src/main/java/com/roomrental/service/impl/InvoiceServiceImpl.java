package com.roomrental.service.impl;

import com.roomrental.dto.request.InvoiceRequest;
import com.roomrental.dto.response.InvoiceResponse;
import com.roomrental.entity.Contract;
import com.roomrental.entity.Invoice;
import com.roomrental.entity.UtilityPrice;
import com.roomrental.entity.User;
import com.roomrental.exception.BadRequestException;
import com.roomrental.exception.ResourceNotFoundException;
import com.roomrental.repository.ContractRepository;
import com.roomrental.repository.InvoiceRepository;
import com.roomrental.repository.RoomServiceRepository;
import com.roomrental.repository.UserRepository;
import com.roomrental.repository.UtilityPriceRepository;
import com.roomrental.entity.RoomService;
import com.roomrental.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;
    private final UtilityPriceRepository utilityPriceRepository;
    private final UserRepository userRepository;
    private final RoomServiceRepository roomServiceRepository;

    @Override
    public List<InvoiceResponse> getAll(Integer thang, Integer nam, Long phongId, Invoice.TrangThai trangThai) {
        return invoiceRepository.findByFilter(thang, nam, phongId, trangThai)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public InvoiceResponse create(InvoiceRequest req) {
        Contract contract = contractRepository.findById(req.hopDongId())
                .orElseThrow(() -> new ResourceNotFoundException("Hợp đồng không tồn tại: " + req.hopDongId()));

        UtilityPrice utilityPrice = null;
        if (req.utilityPriceId() != null) {
            utilityPrice = utilityPriceRepository.findById(req.utilityPriceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Đơn giá không tồn tại: " + req.utilityPriceId()));
        } else {
            utilityPrice = utilityPriceRepository.findTopByOrderByApDungTuDesc().orElse(null);
        }

        BigDecimal dienDau  = nvl(req.chiSoDienDau());
        BigDecimal dienCuoi = nvl(req.chiSoDienCuoi());
        BigDecimal nuocDau  = nvl(req.chiSoNuocDau());
        BigDecimal nuocCuoi = nvl(req.chiSoNuocCuoi());
        BigDecimal phiKhac  = nvl(req.phiKhac());

        BigDecimal tieuThuDien = dienCuoi.subtract(dienDau);
        BigDecimal tieuThuNuoc = nuocCuoi.subtract(nuocDau);
        if (tieuThuDien.compareTo(BigDecimal.ZERO) < 0) throw new BadRequestException("Chỉ số điện cuối phải >= chỉ số đầu");
        if (tieuThuNuoc.compareTo(BigDecimal.ZERO) < 0) throw new BadRequestException("Chỉ số nước cuối phải >= chỉ số đầu");

        BigDecimal tienDien  = BigDecimal.ZERO;
        BigDecimal tienNuoc  = BigDecimal.ZERO;
        if (utilityPrice != null) {
            tienDien = tieuThuDien.multiply(utilityPrice.getDonGiaDien());
            tienNuoc = tieuThuNuoc.multiply(utilityPrice.getDonGiaNuoc());
        }

        BigDecimal tienDichVuThem = BigDecimal.ZERO;
        List<RoomService> services = roomServiceRepository.findByRoomId(contract.getRoom().getId());
        for (RoomService rs : services) {
            BigDecimal price = rs.getDonGiaOverride() != null ? rs.getDonGiaOverride() : rs.getService().getDonGiaMacDinh();
            String donVi = rs.getService().getDonVi();
            if (donVi != null && donVi.toLowerCase().contains("người")) {
                tienDichVuThem = tienDichVuThem.add(price.multiply(BigDecimal.valueOf(contract.getSoNguoiO())));
            } else {
                tienDichVuThem = tienDichVuThem.add(price);
            }
        }

        BigDecimal tongTien = contract.getGiaThue()
                .add(tienDien).add(tienNuoc).add(tienDichVuThem).add(phiKhac);

        Invoice invoice = Invoice.builder()
                .hopDong(contract)
                .utilityPrice(utilityPrice)
                .thang(req.thang())
                .nam(req.nam())
                .chiSoDienDau(dienDau)
                .chiSoDienCuoi(dienCuoi)
                .chiSoNuocDau(nuocDau)
                .chiSoNuocCuoi(nuocCuoi)
                .phiKhac(phiKhac)
                .ghiChuPhiKhac(req.ghiChuPhiKhac())
                .tongTien(tongTien)
                .trangThai(Invoice.TrangThai.CHUA_TT)
                .build();

        return toResponse(invoiceRepository.save(invoice));
    }

    @Override
    public InvoiceResponse getById(Long id) {
        return toResponse(findInvoice(id));
    }

    @Override
    @Transactional
    public InvoiceResponse markPaid(Long id) {
        Invoice invoice = findInvoice(id);
        if (invoice.getTrangThai() == Invoice.TrangThai.DA_TT) {
            throw new BadRequestException("Hóa đơn đã được thanh toán trước đó");
        }
        invoice.setTrangThai(Invoice.TrangThai.DA_TT);
        invoice.setNgayThanhToan(LocalDateTime.now());
        return toResponse(invoiceRepository.save(invoice));
    }

    @Override
    public List<InvoiceResponse> getMyInvoices(String soDienThoai) {
        User user = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        return invoiceRepository.findByHopDongKhachThueId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    // -------- helpers --------

    private Invoice findInvoice(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại: " + id));
    }

    private BigDecimal nvl(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }

    private InvoiceResponse toResponse(Invoice i) {
        return new InvoiceResponse(
                i.getId(),
                i.getHopDong().getId(),
                i.getHopDong().getRoom().getId(),
                i.getHopDong().getRoom().getTenPhong(),
                i.getUtilityPrice() != null ? i.getUtilityPrice().getId() : null,
                i.getThang(), i.getNam(),
                i.getChiSoDienDau(), i.getChiSoDienCuoi(),
                i.getChiSoNuocDau(), i.getChiSoNuocCuoi(),
                i.getPhiKhac(), i.getGhiChuPhiKhac(),
                i.getTongTien(), i.getHopDong().getSoNguoiO(), i.getTrangThai(),
                i.getNgayThanhToan(), i.getCreatedAt());
    }
}
