package com.roomrental.config;

import com.roomrental.entity.*;
import com.roomrental.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seed dữ liệu dịch vụ mặc định khi ứng dụng khởi động.
 * Idempotent: chỉ thêm nếu chưa tồn tại.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {

    private final ServiceRepository serviceRepository;
    private final RoomRepository roomRepository;
    private final RoomServiceRepository roomServiceRepository;
    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final InvoiceRepository invoiceRepository;
    private final UtilityPriceRepository utilityPriceRepository;
    private final RepairRequestRepository repairRequestRepository;
    private final PasswordEncoder passwordEncoder;

    // Danh sách dịch vụ mặc định
    private static final List<ServiceSeed> DEFAULT_SERVICES = List.of(
        new ServiceSeed("Internet",          new BigDecimal("100000"), "đ/phòng"),
        new ServiceSeed("Gửi xe máy",        new BigDecimal("100000"), "đ/xe"),
        new ServiceSeed("Gửi xe đạp",        new BigDecimal("30000"),  "đ/xe"),
        new ServiceSeed("Dịch vụ vệ sinh",   new BigDecimal("50000"),  "đ/phòng"),
        new ServiceSeed("Thang máy",         new BigDecimal("50000"),  "đ/người")
    );

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedServices();
        seedRooms();
        assignServicesToAllRooms();
        seedUsers();
        seedContractAndInvoices();
    }

    private void seedServices() {
        for (ServiceSeed seed : DEFAULT_SERVICES) {
            if (!serviceRepository.existsByTenDichVu(seed.ten())) {
                Service service = Service.builder()
                    .tenDichVu(seed.ten())
                    .donGiaMacDinh(seed.donGia())
                    .donVi(seed.donVi())
                    .build();
                serviceRepository.save(service);
                log.info("Seeded service: {}", seed.ten());
            }
        }
    }

    private void seedRooms() {
        if (roomRepository.count() == 0) {
            Room r1 = Room.builder()
                .tenPhong("Phòng 101")
                .dienTich(new BigDecimal("20.0"))
                .soNguoiToiDa(2)
                .tienNghi("Điều hòa, Máy giặt, Giường")
                .giaThue(new BigDecimal("3000000"))
                .trangThai(Room.TrangThai.TRONG)
                .build();
            roomRepository.save(r1);

            Room r2 = Room.builder()
                .tenPhong("Phòng 102")
                .dienTich(new BigDecimal("25.0"))
                .soNguoiToiDa(3)
                .tienNghi("Điều hòa, Tủ lạnh, Giường")
                .giaThue(new BigDecimal("4000000"))
                .trangThai(Room.TrangThai.TRONG)
                .build();
            roomRepository.save(r2);

            Room r3 = Room.builder()
                .tenPhong("Phòng 103")
                .dienTich(new BigDecimal("18.0"))
                .soNguoiToiDa(2)
                .tienNghi("Điều hòa")
                .giaThue(new BigDecimal("2500000"))
                .trangThai(Room.TrangThai.DANG_SUA)
                .build();
            roomRepository.save(r3);
            log.info("Seeded 3 default rooms");
        }
    }

    private void assignServicesToAllRooms() {
        List<Service> allServices = serviceRepository.findAll();
        List<Room> allRooms = roomRepository.findAll();

        for (Room room : allRooms) {
            List<RoomService> existingLinks = roomServiceRepository.findByRoomId(room.getId());
            for (Service service : allServices) {
                boolean alreadyLinked = existingLinks.stream()
                    .anyMatch(rs -> rs.getService().getId().equals(service.getId()));
                if (!alreadyLinked) {
                    RoomService rs = RoomService.builder()
                        .room(room)
                        .service(service)
                        .donGiaOverride(null) // dùng giá mặc định
                        .build();
                    roomServiceRepository.save(rs);
                    log.info("Assigned service '{}' to room '{}'", service.getTenDichVu(), room.getTenPhong());
                }
            }
        }
    }

    private void seedUsers() {
        if (userRepository.findBySoDienThoai("0123456789").isEmpty()) {
            User admin = User.builder()
                .hoTen("Vũ Tuấn Hải")
                .soDienThoai("0123456789")
                .email("haivt@myroom.com")
                .matKhau(passwordEncoder.encode("admin123"))
                .vaiTro(User.VaiTro.ADMIN)
                .doiMkLanDau(false)
                .build();
            userRepository.save(admin);
            log.info("Seeded Admin user Vũ Tuấn Hải");
        }
        if (userRepository.findBySoDienThoai("0987654321").isEmpty()) {
            User tenant = User.builder()
                .hoTen("Nguyễn Văn A")
                .soDienThoai("0987654321")
                .email("tenant.a@gmail.com")
                .matKhau(passwordEncoder.encode("password123"))
                .vaiTro(User.VaiTro.TENANT)
                .doiMkLanDau(false)
                .cccd("123456789123")
                .queQuan("Hà Nội")
                .build();
            userRepository.save(tenant);
            log.info("Seeded Tenant user Nguyễn Văn A");
        }
    }

    private void seedContractAndInvoices() {
        // Seed UtilityPrice if not present
        UtilityPrice up = utilityPriceRepository.findTopByOrderByApDungTuDesc().orElse(null);
        if (up == null) {
            up = UtilityPrice.builder()
                .donGiaDien(new BigDecimal("3500"))
                .donGiaNuoc(new BigDecimal("15000"))
                .apDungTu(LocalDate.of(2026, 1, 1))
                .ghiChu("Giá mặc định seeder")
                .build();
            utilityPriceRepository.save(up);
        }

        // --- SEED FOR TENANT 1 (0987654321) ON ROOM 101 ---
        User tenant1 = userRepository.findBySoDienThoai("0987654321").orElse(null);
        Room room101 = roomRepository.findAll().stream()
            .filter(r -> r.getTenPhong().equals("Phòng 101"))
            .findFirst()
            .orElse(null);

        if (tenant1 != null && room101 != null) {
            boolean hasContract101 = contractRepository.findAll().stream()
                .anyMatch(c -> c.getKhachThue().getId().equals(tenant1.getId()) && c.getRoom().getId().equals(room101.getId()));
            if (!hasContract101) {
                List<Service> services = serviceRepository.findAll();
                Contract contract = Contract.builder()
                    .room(room101)
                    .khachThue(tenant1)
                    .ngayBatDau(LocalDate.of(2026, 1, 1))
                    .ngayKetThuc(LocalDate.of(2026, 12, 31))
                    .giaThue(room101.getGiaThue())
                    .tienCoc(room101.getGiaThue())
                    .soNguoiO(1)
                    .trangThai(Contract.TrangThai.HIEU_LUC)
                    .dichVu(services)
                    .kyDongTien(1)
                    .build();
                contractRepository.save(contract);
                
                room101.setTrangThai(Room.TrangThai.DA_THUE);
                roomRepository.save(room101);

                log.info("Seeded active contract for Room 101");

                // Jan 2026 (Paid)
                Invoice inv1 = Invoice.builder()
                    .hopDong(contract)
                    .utilityPrice(up)
                    .thang(1).nam(2026)
                    .chiSoDienDau(new BigDecimal("100"))
                    .chiSoDienCuoi(new BigDecimal("220")) // 120 kWh = 420,000 đ
                    .chiSoNuocDau(new BigDecimal("10"))
                    .chiSoNuocCuoi(new BigDecimal("18")) // 8 m3 = 120,000 đ
                    .phiKhac(BigDecimal.ZERO)
                    .tongTien(new BigDecimal("3740000")) // Rent 3M + services 200k + utilities 540k
                    .trangThai(Invoice.TrangThai.DA_TT)
                    .daGui(true)
                    .ngayThanhToan(LocalDateTime.of(2026, 1, 31, 20, 0))
                    .build();
                invoiceRepository.save(inv1);

                // Feb 2026 (Paid)
                Invoice inv2 = Invoice.builder()
                    .hopDong(contract)
                    .utilityPrice(up)
                    .thang(2).nam(2026)
                    .chiSoDienDau(new BigDecimal("220"))
                    .chiSoDienCuoi(new BigDecimal("350")) // 130 kWh = 455,000 đ
                    .chiSoNuocDau(new BigDecimal("18"))
                    .chiSoNuocCuoi(new BigDecimal("25")) // 7 m3 = 105,000 đ
                    .phiKhac(BigDecimal.ZERO)
                    .tongTien(new BigDecimal("3760000")) // Rent 3M + services 200k + utilities 560k
                    .trangThai(Invoice.TrangThai.DA_TT)
                    .daGui(true)
                    .ngayThanhToan(LocalDateTime.of(2026, 2, 28, 20, 0))
                    .build();
                invoiceRepository.save(inv2);

                // Mar 2026 (Paid)
                Invoice inv3 = Invoice.builder()
                    .hopDong(contract)
                    .utilityPrice(up)
                    .thang(3).nam(2026)
                    .chiSoDienDau(new BigDecimal("350"))
                    .chiSoDienCuoi(new BigDecimal("490")) // 140 kWh = 490,000 đ
                    .chiSoNuocDau(new BigDecimal("25"))
                    .chiSoNuocCuoi(new BigDecimal("34")) // 9 m3 = 135,000 đ
                    .phiKhac(BigDecimal.ZERO)
                    .tongTien(new BigDecimal("3825000")) // Rent 3M + services 200k + utilities 625k
                    .trangThai(Invoice.TrangThai.DA_TT)
                    .daGui(true)
                    .ngayThanhToan(LocalDateTime.of(2026, 3, 31, 20, 0))
                    .build();
                invoiceRepository.save(inv3);

                // Apr 2026 (Paid)
                Invoice inv4 = Invoice.builder()
                    .hopDong(contract)
                    .utilityPrice(up)
                    .thang(4).nam(2026)
                    .chiSoDienDau(new BigDecimal("490"))
                    .chiSoDienCuoi(new BigDecimal("610")) // 120 kWh = 420,000 đ
                    .chiSoNuocDau(new BigDecimal("34"))
                    .chiSoNuocCuoi(new BigDecimal("42")) // 8 m3 = 120,000 đ
                    .phiKhac(BigDecimal.ZERO)
                    .tongTien(new BigDecimal("3740000"))
                    .trangThai(Invoice.TrangThai.DA_TT)
                    .daGui(true)
                    .ngayThanhToan(LocalDateTime.of(2026, 4, 30, 20, 0))
                    .build();
                invoiceRepository.save(inv4);

                // May 2026 (Paid)
                Invoice inv5 = Invoice.builder()
                    .hopDong(contract)
                    .utilityPrice(up)
                    .thang(5).nam(2026)
                    .chiSoDienDau(new BigDecimal("610"))
                    .chiSoDienCuoi(new BigDecimal("740")) // 130 kWh = 455,000 đ
                    .chiSoNuocDau(new BigDecimal("42"))
                    .chiSoNuocCuoi(new BigDecimal("51")) // 9 m3 = 135,000 đ
                    .phiKhac(BigDecimal.ZERO)
                    .tongTien(new BigDecimal("3790000"))
                    .trangThai(Invoice.TrangThai.DA_TT)
                    .daGui(true)
                    .ngayThanhToan(LocalDateTime.of(2026, 5, 31, 20, 0))
                    .build();
                invoiceRepository.save(inv5);

                // June 2026 (Unpaid)
                Invoice inv6 = Invoice.builder()
                    .hopDong(contract)
                    .utilityPrice(up)
                    .thang(6).nam(2026)
                    .chiSoDienDau(new BigDecimal("740"))
                    .chiSoDienCuoi(new BigDecimal("740"))
                    .chiSoNuocDau(new BigDecimal("51"))
                    .chiSoNuocCuoi(new BigDecimal("51"))
                    .phiKhac(BigDecimal.ZERO)
                    .tongTien(new BigDecimal("3200000"))
                    .trangThai(Invoice.TrangThai.CHUA_TT)
                    .daGui(true)
                    .build();
                invoiceRepository.save(inv6);

                log.info("Seeded 6 monthly invoices (5 PAID, 1 UNPAID) for Room 101");

                // Seed repair requests
                RepairRequest req1 = RepairRequest.builder()
                    .hopDong(contract)
                    .moTa("Hỏng bóng đèn vệ sinh")
                    .trangThai(RepairRequest.TrangThai.HOAN_THANH)
                    .chiPhi(new BigDecimal("50000"))
                    .ngayGui(LocalDateTime.of(2026, 2, 15, 9, 0))
                    .ngayCapNhat(LocalDateTime.of(2026, 2, 16, 14, 0))
                    .build();
                repairRequestRepository.save(req1);

                RepairRequest req2 = RepairRequest.builder()
                    .hopDong(contract)
                    .moTa("Rò rỉ vòi hoa sen")
                    .trangThai(RepairRequest.TrangThai.HOAN_THANH)
                    .chiPhi(new BigDecimal("150000"))
                    .ngayGui(LocalDateTime.of(2026, 4, 10, 8, 30))
                    .ngayCapNhat(LocalDateTime.of(2026, 4, 11, 10, 0))
                    .build();
                repairRequestRepository.save(req2);

                log.info("Seeded 2 completed repair requests for Room 101");
            }
        }

        // --- SEED FOR EXISTING TENANT 2 (0902345678) ON THEIR EXISTING ROOM/CONTRACT ---
        User tenant2 = userRepository.findBySoDienThoai("0902345678").orElse(null);
        if (tenant2 != null) {
            // Find active contract for this user (preferably in Room "Phòng 663202")
            Contract contract2 = contractRepository.findAll().stream()
                .filter(c -> c.getKhachThue().getId().equals(tenant2.getId()) && c.getTrangThai() == Contract.TrangThai.HIEU_LUC)
                .findFirst()
                .orElse(null);

            if (contract2 != null) {
                log.info("Found active contract for tenant 0902345678: id={}, room={}", contract2.getId(), contract2.getRoom().getTenPhong());
                
                // Let's seed invoices for Feb, Mar, Apr, May 2026 if they don't exist
                seedInvoiceIfNotExist(contract2, up, 2, 2026, new BigDecimal("150"), new BigDecimal("230"), new BigDecimal("20"), new BigDecimal("26"), true);
                seedInvoiceIfNotExist(contract2, up, 3, 2026, new BigDecimal("230"), new BigDecimal("320"), new BigDecimal("26"), new BigDecimal("33"), true);
                seedInvoiceIfNotExist(contract2, up, 4, 2026, new BigDecimal("320"), new BigDecimal("430"), new BigDecimal("33"), new BigDecimal("39"), true);
                seedInvoiceIfNotExist(contract2, up, 5, 2026, new BigDecimal("430"), new BigDecimal("550"), new BigDecimal("39"), new BigDecimal("47"), true);
            } else {
                log.warn("Active contract not found for tenant 0902345678");
            }
        }
    }

    private void seedInvoiceIfNotExist(Contract contract, UtilityPrice up, int thang, int nam,
                                       BigDecimal dienDau, BigDecimal dienCuoi,
                                       BigDecimal nuocDau, BigDecimal nuocCuoi, boolean paid) {
        boolean exists = invoiceRepository.findAll().stream()
            .anyMatch(inv -> inv.getHopDong().getId().equals(contract.getId())
                && inv.getThang() == thang
                && inv.getNam() == nam);
        if (!exists) {
            // Calculate total price:
            // Rent
            BigDecimal rent = contract.getGiaThue();
            
            // Electricity: (dienCuoi - dienDau) * donGiaDien
            BigDecimal dienTieuThu = dienCuoi.subtract(dienDau);
            BigDecimal donGiaDien = up != null ? up.getDonGiaDien() : new BigDecimal("3500");
            BigDecimal tienDien = dienTieuThu.multiply(donGiaDien);
            
            // Water: (nuocCuoi - nuocDau) * donGiaNuoc
            BigDecimal nuocTieuThu = nuocCuoi.subtract(nuocDau);
            BigDecimal donGiaNuoc = up != null ? up.getDonGiaNuoc() : new BigDecimal("15000");
            BigDecimal tienNuoc = nuocTieuThu.multiply(donGiaNuoc);
            
            // Services:
            BigDecimal tienDichVu = BigDecimal.ZERO;
            if (contract.getDichVu() != null) {
                for (Service service : contract.getDichVu()) {
                    BigDecimal price = service.getDonGiaMacDinh();
                    // If calculated per person, multiply by contract.getSoNguoiO()
                    if ("đ/người".equals(service.getDonVi())) {
                        price = price.multiply(BigDecimal.valueOf(contract.getSoNguoiO()));
                    }
                    tienDichVu = tienDichVu.add(price);
                }
            }
            
            BigDecimal tongTien = rent.add(tienDien).add(tienNuoc).add(tienDichVu);
            
            Invoice invoice = Invoice.builder()
                .hopDong(contract)
                .utilityPrice(up)
                .thang(thang)
                .nam(nam)
                .chiSoDienDau(dienDau)
                .chiSoDienCuoi(dienCuoi)
                .chiSoNuocDau(nuocDau)
                .chiSoNuocCuoi(nuocCuoi)
                .phiKhac(BigDecimal.ZERO)
                .tongTien(tongTien)
                .trangThai(paid ? Invoice.TrangThai.DA_TT : Invoice.TrangThai.CHUA_TT)
                .daGui(true)
                .ngayThanhToan(paid ? LocalDateTime.of(nam, thang, 28, 20, 0) : null)
                .build();
            
            invoiceRepository.save(invoice);
            log.info("Seeded invoice for contract id {} (Room {}), month {}/{} - Total: {}",
                contract.getId(), contract.getRoom().getTenPhong(), thang, nam, tongTien);
        }
    }

    private record ServiceSeed(String ten, BigDecimal donGia, String donVi) {}
}
