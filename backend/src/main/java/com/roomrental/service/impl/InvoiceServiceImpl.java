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
import com.roomrental.service.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;
    private final UtilityPriceRepository utilityPriceRepository;
    private final UserRepository userRepository;
    private final RoomServiceRepository roomServiceRepository;
    private final MailService mailService;

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

        int prevThang = req.thang() == 1 ? 12 : req.thang() - 1;
        int prevNam = req.thang() == 1 ? req.nam() - 1 : req.nam();
        BigDecimal dienDau = req.chiSoDienDau();
        BigDecimal nuocDau = req.chiSoNuocDau();
        if (dienDau == null || dienDau.compareTo(BigDecimal.ZERO) == 0 || nuocDau == null || nuocDau.compareTo(BigDecimal.ZERO) == 0) {
            java.util.Optional<Invoice> prevInvoiceOpt = invoiceRepository.findTopByHopDongIdAndThangAndNam(contract.getId(), prevThang, prevNam);
            if (prevInvoiceOpt.isPresent()) {
                if (dienDau == null || dienDau.compareTo(BigDecimal.ZERO) == 0) {
                    dienDau = prevInvoiceOpt.get().getChiSoDienCuoi();
                }
                if (nuocDau == null || nuocDau.compareTo(BigDecimal.ZERO) == 0) {
                    nuocDau = prevInvoiceOpt.get().getChiSoNuocCuoi();
                }
            }
        }
        dienDau = nvl(dienDau);
        BigDecimal dienCuoi = nvl(req.chiSoDienCuoi());
        nuocDau = nvl(nuocDau);
        BigDecimal nuocCuoi = nvl(req.chiSoNuocCuoi());

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
            int quantity = rs.getSoLuong() != null ? rs.getSoLuong() : 1;
            BigDecimal subtotal;
            if (donVi != null && donVi.toLowerCase().contains("người")) {
                if (quantity == 1 && contract.getSoNguoiO() > 1) {
                    subtotal = price.multiply(BigDecimal.valueOf(contract.getSoNguoiO()));
                } else {
                    subtotal = price.multiply(BigDecimal.valueOf(quantity));
                }
            } else {
                subtotal = price.multiply(BigDecimal.valueOf(quantity));
            }
            tienDichVuThem = tienDichVuThem.add(subtotal);
        }

        BigDecimal tongTien = contract.getGiaThue()
                .add(tienDien).add(tienNuoc).add(tienDichVuThem);

        Invoice invoice = Invoice.builder()
                .hopDong(contract)
                .utilityPrice(utilityPrice)
                .thang(req.thang())
                .nam(req.nam())
                .chiSoDienDau(dienDau)
                .chiSoDienCuoi(dienCuoi)
                .chiSoNuocDau(nuocDau)
                .chiSoNuocCuoi(nuocCuoi)
                .phiKhac(BigDecimal.ZERO)
                .ghiChuPhiKhac(null)
                .tongTien(tongTien)
                .trangThai(Invoice.TrangThai.CHUA_TT)
                .daGui(false)
                .build();

        return toResponse(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceResponse update(Long id, InvoiceRequest req) {
        Invoice invoice = findInvoice(id);
        if (invoice.getTrangThai() == Invoice.TrangThai.DA_TT) {
            throw new BadRequestException("Không thể chỉnh sửa hóa đơn đã thanh toán");
        }

        BigDecimal dienDau = req.chiSoDienDau();
        BigDecimal nuocDau = req.chiSoNuocDau();
        if (dienDau == null || dienDau.compareTo(BigDecimal.ZERO) == 0 || nuocDau == null || nuocDau.compareTo(BigDecimal.ZERO) == 0) {
            int prevThang = invoice.getThang() == 1 ? 12 : invoice.getThang() - 1;
            int prevNam = invoice.getThang() == 1 ? invoice.getNam() - 1 : invoice.getNam();
            java.util.Optional<Invoice> prevInvoiceOpt = invoiceRepository.findTopByHopDongIdAndThangAndNam(invoice.getHopDong().getId(), prevThang, prevNam);
            if (prevInvoiceOpt.isPresent()) {
                if (dienDau == null || dienDau.compareTo(BigDecimal.ZERO) == 0) {
                    dienDau = prevInvoiceOpt.get().getChiSoDienCuoi();
                }
                if (nuocDau == null || nuocDau.compareTo(BigDecimal.ZERO) == 0) {
                    nuocDau = prevInvoiceOpt.get().getChiSoNuocCuoi();
                }
            }
        }
        dienDau = nvl(dienDau);
        BigDecimal dienCuoi = nvl(req.chiSoDienCuoi());
        nuocDau = nvl(nuocDau);
        BigDecimal nuocCuoi = nvl(req.chiSoNuocCuoi());

        BigDecimal tieuThuDien = dienCuoi.subtract(dienDau);
        BigDecimal tieuThuNuoc = nuocCuoi.subtract(nuocDau);
        if (tieuThuDien.compareTo(BigDecimal.ZERO) < 0) throw new BadRequestException("Chỉ số điện cuối phải >= chỉ số đầu");
        if (tieuThuNuoc.compareTo(BigDecimal.ZERO) < 0) throw new BadRequestException("Chỉ số nước cuối phải >= chỉ số đầu");

        invoice.setChiSoDienDau(dienDau);
        invoice.setChiSoDienCuoi(dienCuoi);
        invoice.setChiSoNuocDau(nuocDau);
        invoice.setChiSoNuocCuoi(nuocCuoi);
        invoice.setPhiKhac(BigDecimal.ZERO);
        invoice.setGhiChuPhiKhac(null);

        UtilityPrice utilityPrice = invoice.getUtilityPrice();
        if (utilityPrice == null) {
            utilityPrice = utilityPriceRepository.findTopByOrderByApDungTuDesc().orElse(null);
            invoice.setUtilityPrice(utilityPrice);
        }

        BigDecimal tienDien = BigDecimal.ZERO;
        BigDecimal tienNuoc = BigDecimal.ZERO;
        if (utilityPrice != null) {
            tienDien = tieuThuDien.multiply(utilityPrice.getDonGiaDien());
            tienNuoc = tieuThuNuoc.multiply(utilityPrice.getDonGiaNuoc());
        }

        BigDecimal tienDichVuThem = BigDecimal.ZERO;
        Contract contract = invoice.getHopDong();
        List<RoomService> services = roomServiceRepository.findByRoomId(contract.getRoom().getId());
        for (RoomService rs : services) {
            BigDecimal price = rs.getDonGiaOverride() != null ? rs.getDonGiaOverride() : rs.getService().getDonGiaMacDinh();
            String donVi = rs.getService().getDonVi();
            int quantity = rs.getSoLuong() != null ? rs.getSoLuong() : 1;
            BigDecimal subtotal;
            if (donVi != null && donVi.toLowerCase().contains("người")) {
                if (quantity == 1 && contract.getSoNguoiO() > 1) {
                    subtotal = price.multiply(BigDecimal.valueOf(contract.getSoNguoiO()));
                } else {
                    subtotal = price.multiply(BigDecimal.valueOf(quantity));
                }
            } else {
                subtotal = price.multiply(BigDecimal.valueOf(quantity));
            }
            tienDichVuThem = tienDichVuThem.add(subtotal);
        }

        BigDecimal tongTien = contract.getGiaThue()
                .add(tienDien).add(tienNuoc).add(tienDichVuThem);

        invoice.setTongTien(tongTien);

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
                .stream()
                .filter(Invoice::getDaGui)
                .map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public List<InvoiceResponse> generateMonthlyInvoices(int thang, int nam) {
        List<Contract> activeContracts = contractRepository.findByTrangThai(Contract.TrangThai.HIEU_LUC);
        List<Invoice> existingInvoices = invoiceRepository.findByFilter(thang, nam, null, null);
        Set<Long> existingContractIds = existingInvoices.stream()
                .map(i -> i.getHopDong().getId())
                .collect(Collectors.toSet());

        int prevThang = thang == 1 ? 12 : thang - 1;
        int prevNam = thang == 1 ? nam - 1 : nam;
        List<Invoice> prevInvoices = invoiceRepository.findByFilter(prevThang, prevNam, null, null);
        Map<Long, Invoice> prevInvoicesMap = prevInvoices.stream()
                .collect(Collectors.toMap(i -> i.getHopDong().getId(), i -> i, (a, b) -> a));

        UtilityPrice currentPrice = utilityPriceRepository.findTopByOrderByApDungTuDesc().orElse(null);

        for (Contract contract : activeContracts) {
            if (existingContractIds.contains(contract.getId())) {
                continue;
            }

            Invoice prevInvoice = prevInvoicesMap.get(contract.getId());
            BigDecimal dienDau = prevInvoice != null ? prevInvoice.getChiSoDienCuoi() : BigDecimal.ZERO;
            BigDecimal nuocDau = prevInvoice != null ? prevInvoice.getChiSoNuocCuoi() : BigDecimal.ZERO;

            BigDecimal tienDichVuThem = BigDecimal.ZERO;
            List<RoomService> services = roomServiceRepository.findByRoomId(contract.getRoom().getId());
            for (RoomService rs : services) {
                BigDecimal price = rs.getDonGiaOverride() != null ? rs.getDonGiaOverride() : rs.getService().getDonGiaMacDinh();
                String donVi = rs.getService().getDonVi();
                int quantity = rs.getSoLuong() != null ? rs.getSoLuong() : 1;
                BigDecimal subtotal;
                if (donVi != null && donVi.toLowerCase().contains("người")) {
                    if (quantity == 1 && contract.getSoNguoiO() > 1) {
                        subtotal = price.multiply(BigDecimal.valueOf(contract.getSoNguoiO()));
                    } else {
                        subtotal = price.multiply(BigDecimal.valueOf(quantity));
                    }
                } else {
                    subtotal = price.multiply(BigDecimal.valueOf(quantity));
                }
                tienDichVuThem = tienDichVuThem.add(subtotal);
            }

            BigDecimal tongTien = contract.getGiaThue().add(tienDichVuThem);

            Invoice newInvoice = Invoice.builder()
                    .hopDong(contract)
                    .utilityPrice(currentPrice)
                    .thang(thang)
                    .nam(nam)
                    .chiSoDienDau(dienDau)
                    .chiSoDienCuoi(dienDau) // Mặc định chỉ số cuối = đầu (tiêu thụ = 0)
                    .chiSoNuocDau(nuocDau)
                    .chiSoNuocCuoi(nuocDau) // Mặc định chỉ số cuối = đầu (tiêu thụ = 0)
                    .phiKhac(BigDecimal.ZERO)
                    .ghiChuPhiKhac(null)
                    .tongTien(tongTien)
                    .trangThai(Invoice.TrangThai.CHUA_TT)
                    .daGui(false)
                    .build();

            invoiceRepository.save(newInvoice);
        }

        return getAll(thang, nam, null, null);
    }

    @Override
    @Transactional
    public void sendInvoice(Long id) {
        Invoice invoice = findInvoice(id);
        invoice.setDaGui(true);
        invoiceRepository.save(invoice);
    }

    @Override
    @Transactional
    public void sendBulkInvoices(int thang, int nam) {
        List<Invoice> invoices = invoiceRepository.findByFilter(thang, nam, null, null);
        for (Invoice i : invoices) {
            i.setDaGui(true);
            invoiceRepository.save(i);
        }
    }

    // -------- helpers --------

    private Invoice findInvoice(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại: " + id));
    }

    private BigDecimal nvl(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }

    private String formatMoney(BigDecimal val) {
        if (val == null) return "0";
        return String.format("%,.0f", val.doubleValue());
    }

    private InvoiceResponse toResponse(Invoice i) {
        BigDecimal tienPhong = i.getHopDong().getGiaThue();
        BigDecimal tienDien = BigDecimal.ZERO;
        BigDecimal tienNuoc = BigDecimal.ZERO;

        if (i.getUtilityPrice() != null) {
            BigDecimal dienTieuThu = nvl(i.getChiSoDienCuoi()).subtract(nvl(i.getChiSoDienDau()));
            BigDecimal nuocTieuThu = nvl(i.getChiSoNuocCuoi()).subtract(nvl(i.getChiSoNuocDau()));
            if (dienTieuThu.compareTo(BigDecimal.ZERO) > 0) {
                tienDien = dienTieuThu.multiply(i.getUtilityPrice().getDonGiaDien());
            }
            if (nuocTieuThu.compareTo(BigDecimal.ZERO) > 0) {
                tienNuoc = nuocTieuThu.multiply(i.getUtilityPrice().getDonGiaNuoc());
            }
        }

        BigDecimal tienDichVu = nvl(i.getTongTien())
                .subtract(nvl(tienPhong))
                .subtract(nvl(tienDien))
                .subtract(nvl(tienNuoc))
                .subtract(nvl(i.getPhiKhac()));

        // Resolve service details
        List<InvoiceResponse.DichVuHoaDon> chiTietDichVu = new java.util.ArrayList<>();
        List<com.roomrental.entity.RoomService> roomServices = roomServiceRepository.findByRoomId(i.getHopDong().getRoom().getId());
        for (com.roomrental.entity.RoomService rs : roomServices) {
            BigDecimal price = rs.getDonGiaOverride() != null ? rs.getDonGiaOverride() : rs.getService().getDonGiaMacDinh();
            String donVi = rs.getService().getDonVi();
            int quantity = rs.getSoLuong() != null ? rs.getSoLuong() : 1;
            BigDecimal subtotal;
            if (donVi != null && donVi.toLowerCase().contains("người")) {
                if (quantity == 1 && i.getHopDong().getSoNguoiO() > 1) {
                    subtotal = price.multiply(BigDecimal.valueOf(i.getHopDong().getSoNguoiO()));
                } else {
                    subtotal = price.multiply(BigDecimal.valueOf(quantity));
                }
            } else {
                subtotal = price.multiply(BigDecimal.valueOf(quantity));
            }
            chiTietDichVu.add(new InvoiceResponse.DichVuHoaDon(
                rs.getService().getTenDichVu(),
                price,
                donVi,
                subtotal
            ));
        }

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
                i.getTongTien(), tienPhong, tienDien, tienNuoc, tienDichVu,
                i.getHopDong().getSoNguoiO(), i.getTrangThai(),
                i.getDaGui(),
                i.getNgayThanhToan(), i.getCreatedAt(),
                chiTietDichVu);
    }
}
