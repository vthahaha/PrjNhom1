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

            Room r4 = Room.builder()
                .tenPhong("Phòng 201")
                .dienTich(new BigDecimal("28.0"))
                .soNguoiToiDa(4)
                .tienNghi("Điều hòa, Tủ lạnh, Máy giặt, Giường, Tủ quần áo")
                .giaThue(new BigDecimal("4500000"))
                .trangThai(Room.TrangThai.TRONG)
                .build();
            roomRepository.save(r4);

            Room r5 = Room.builder()
                .tenPhong("Phòng 202")
                .dienTich(new BigDecimal("22.0"))
                .soNguoiToiDa(2)
                .tienNghi("Điều hòa, Giường, Tủ quần áo")
                .giaThue(new BigDecimal("3200000"))
                .trangThai(Room.TrangThai.TRONG)
                .build();
            roomRepository.save(r5);

            Room r6 = Room.builder()
                .tenPhong("Phòng 203")
                .dienTich(new BigDecimal("20.0"))
                .soNguoiToiDa(2)
                .tienNghi("Điều hòa, Tủ lạnh")
                .giaThue(new BigDecimal("3000000"))
                .trangThai(Room.TrangThai.TRONG)
                .build();
            roomRepository.save(r6);

            Room r7 = Room.builder()
                .tenPhong("Phòng 301")
                .dienTich(new BigDecimal("28.0"))
                .soNguoiToiDa(4)
                .tienNghi("Điều hòa, Máy giặt, Tủ lạnh, Giường")
                .giaThue(new BigDecimal("4500000"))
                .trangThai(Room.TrangThai.TRONG)
                .build();
            roomRepository.save(r7);

            Room r8 = Room.builder()
                .tenPhong("Phòng 302")
                .dienTich(new BigDecimal("22.0"))
                .soNguoiToiDa(2)
                .tienNghi("Điều hòa, Tủ lạnh, Giường")
                .giaThue(new BigDecimal("3200000"))
                .trangThai(Room.TrangThai.TRONG)
                .build();
            roomRepository.save(r8);

            Room r9 = Room.builder()
                .tenPhong("Phòng 303")
                .dienTich(new BigDecimal("20.0"))
                .soNguoiToiDa(2)
                .tienNghi("Điều hòa, Tủ lạnh, Giường, Tủ quần áo")
                .giaThue(new BigDecimal("3000000"))
                .trangThai(Room.TrangThai.TRONG)
                .build();
            roomRepository.save(r9);

            Room r10 = Room.builder()
                .tenPhong("Phòng 401")
                .dienTich(new BigDecimal("35.0"))
                .soNguoiToiDa(4)
                .tienNghi("Điều hòa, Tủ lạnh, Máy giặt, Giường, Tủ quần áo, Sofa")
                .giaThue(new BigDecimal("6000000"))
                .trangThai(Room.TrangThai.TRONG)
                .build();
            roomRepository.save(r10);

            Room r11 = Room.builder()
                .tenPhong("Phòng 402")
                .dienTich(new BigDecimal("20.0"))
                .soNguoiToiDa(2)
                .tienNghi("Điều hòa, Giường")
                .giaThue(new BigDecimal("3000000"))
                .trangThai(Room.TrangThai.DANG_SUA)
                .build();
            roomRepository.save(r11);

            log.info("Seeded 11 default rooms");
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
                .hoTen("Nguyễn Minh Triết")
                .soDienThoai("0987654321")
                .email("tenant.a@gmail.com")
                .matKhau(passwordEncoder.encode("password123"))
                .vaiTro(User.VaiTro.TENANT)
                .doiMkLanDau(false)
                .cccd("123456789123")
                .queQuan("Hà Nội")
                .build();
            userRepository.save(tenant);
            log.info("Seeded Tenant user Nguyễn Minh Triết");
        }
        if (userRepository.findBySoDienThoai("0911223344").isEmpty()) {
            User tenant = User.builder()
                .hoTen("Trần Thu Hà")
                .soDienThoai("0911223344")
                .email("tenant.b@gmail.com")
                .matKhau(passwordEncoder.encode("password123"))
                .vaiTro(User.VaiTro.TENANT)
                .doiMkLanDau(false)
                .cccd("123456789002")
                .queQuan("Đà Nẵng")
                .build();
            userRepository.save(tenant);
            log.info("Seeded Tenant user Trần Thu Hà");
        }
        if (userRepository.findBySoDienThoai("0922334455").isEmpty()) {
            User tenant = User.builder()
                .hoTen("Lê Quốc Anh")
                .soDienThoai("0922334455")
                .email("tenant.c@gmail.com")
                .matKhau(passwordEncoder.encode("password123"))
                .vaiTro(User.VaiTro.TENANT)
                .doiMkLanDau(false)
                .cccd("123456789003")
                .queQuan("TP. Hồ Chí Minh")
                .build();
            userRepository.save(tenant);
            log.info("Seeded Tenant user Lê Quốc Anh");
        }
        if (userRepository.findBySoDienThoai("0933445566").isEmpty()) {
            User tenant = User.builder()
                .hoTen("Phạm Hồng Đăng")
                .soDienThoai("0933445566")
                .email("tenant.d@gmail.com")
                .matKhau(passwordEncoder.encode("password123"))
                .vaiTro(User.VaiTro.TENANT)
                .doiMkLanDau(false)
                .cccd("123456789004")
                .queQuan("Hải Phòng")
                .build();
            userRepository.save(tenant);
            log.info("Seeded Tenant user Phạm Hồng Đăng");
        }
        if (userRepository.findBySoDienThoai("0944556677").isEmpty()) {
            User tenant = User.builder()
                .hoTen("Hoàng Mai Chi")
                .soDienThoai("0944556677")
                .email("tenant.e@gmail.com")
                .matKhau(passwordEncoder.encode("password123"))
                .vaiTro(User.VaiTro.TENANT)
                .doiMkLanDau(false)
                .cccd("123456789005")
                .queQuan("Quảng Ninh")
                .build();
            userRepository.save(tenant);
            log.info("Seeded Tenant user Hoàng Mai Chi");
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

        List<Service> services = serviceRepository.findAll();

        // ─── SEED FOR TENANT 1 (Nguyễn Minh Triết) ON ROOM 101 ───
        User tenant1 = userRepository.findBySoDienThoai("0987654321").orElse(null);
        Room room101 = roomRepository.findAll().stream()
            .filter(r -> r.getTenPhong().equals("Phòng 101"))
            .findFirst()
            .orElse(null);

        if (tenant1 != null && room101 != null) {
            boolean hasContract101 = contractRepository.findAll().stream()
                .anyMatch(c -> c.getKhachThue().getId().equals(tenant1.getId()) && c.getRoom().getId().equals(room101.getId()));
            if (!hasContract101) {
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

                // Seed Invoices for Room 101 (Jan to May paid, June unpaid)
                seedInvoiceIfNotExist(contract, up, 1, 2026, new BigDecimal("100"), new BigDecimal("220"), new BigDecimal("10"), new BigDecimal("18"), true);
                seedInvoiceIfNotExist(contract, up, 2, 2026, new BigDecimal("220"), new BigDecimal("350"), new BigDecimal("18"), new BigDecimal("25"), true);
                seedInvoiceIfNotExist(contract, up, 3, 2026, new BigDecimal("350"), new BigDecimal("490"), new BigDecimal("25"), new BigDecimal("34"), true);
                seedInvoiceIfNotExist(contract, up, 4, 2026, new BigDecimal("490"), new BigDecimal("610"), new BigDecimal("34"), new BigDecimal("42"), true);
                seedInvoiceIfNotExist(contract, up, 5, 2026, new BigDecimal("610"), new BigDecimal("740"), new BigDecimal("42"), new BigDecimal("51"), true);
                seedInvoiceIfNotExist(contract, up, 6, 2026, new BigDecimal("740"), new BigDecimal("740"), new BigDecimal("51"), new BigDecimal("51"), false);

                // Seed completed repair requests
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

                // Seed pending / ongoing repair requests for demo
                RepairRequest req3 = RepairRequest.builder()
                    .hopDong(contract)
                    .moTa("Hỏng công tắc bình nóng lạnh, nước không ấm")
                    .trangThai(RepairRequest.TrangThai.CHO_XU_LY)
                    .ngayGui(LocalDateTime.of(2026, 6, 24, 15, 0))
                    .build();
                repairRequestRepository.save(req3);
            }
        }

        // ─── SEED FOR TENANT 2 (Trần Thu Hà) ON ROOM 102 ───
        User tenant2 = userRepository.findBySoDienThoai("0911223344").orElse(null);
        Room room102 = roomRepository.findAll().stream()
            .filter(r -> r.getTenPhong().equals("Phòng 102"))
            .findFirst()
            .orElse(null);

        if (tenant2 != null && room102 != null) {
            boolean hasContract102 = contractRepository.findAll().stream()
                .anyMatch(c -> c.getKhachThue().getId().equals(tenant2.getId()) && c.getRoom().getId().equals(room102.getId()));
            if (!hasContract102) {
                Contract contract = Contract.builder()
                    .room(room102)
                    .khachThue(tenant2)
                    .ngayBatDau(LocalDate.of(2026, 2, 1))
                    .ngayKetThuc(LocalDate.of(2027, 1, 31))
                    .giaThue(room102.getGiaThue())
                    .tienCoc(room102.getGiaThue())
                    .soNguoiO(2)
                    .trangThai(Contract.TrangThai.HIEU_LUC)
                    .dichVu(services)
                    .kyDongTien(1)
                    .build();
                contractRepository.save(contract);
                
                room102.setTrangThai(Room.TrangThai.DA_THUE);
                roomRepository.save(room102);

                log.info("Seeded active contract for Room 102");

                // Seed Invoices for Room 102 (Feb to May paid, June unpaid)
                seedInvoiceIfNotExist(contract, up, 2, 2026, new BigDecimal("120"), new BigDecimal("250"), new BigDecimal("8"), new BigDecimal("17"), true);
                seedInvoiceIfNotExist(contract, up, 3, 2026, new BigDecimal("250"), new BigDecimal("390"), new BigDecimal("17"), new BigDecimal("26"), true);
                seedInvoiceIfNotExist(contract, up, 4, 2026, new BigDecimal("390"), new BigDecimal("520"), new BigDecimal("26"), new BigDecimal("34"), true);
                seedInvoiceIfNotExist(contract, up, 5, 2026, new BigDecimal("520"), new BigDecimal("670"), new BigDecimal("34"), new BigDecimal("43"), true);
                seedInvoiceIfNotExist(contract, up, 6, 2026, new BigDecimal("670"), new BigDecimal("670"), new BigDecimal("43"), new BigDecimal("43"), false);

                // Seed pending repair request
                RepairRequest req = RepairRequest.builder()
                    .hopDong(contract)
                    .moTa("Cửa sổ bị kẹt không đóng chặt được khi trời mưa")
                    .trangThai(RepairRequest.TrangThai.DANG_XU_LY)
                    .ngayGui(LocalDateTime.of(2026, 6, 23, 10, 30))
                    .build();
                repairRequestRepository.save(req);
            }
        }

        // ─── SEED FOR TENANT 3 (Lê Quốc Anh) ON ROOM 202 ───
        User tenant3 = userRepository.findBySoDienThoai("0922334455").orElse(null);
        Room room202 = roomRepository.findAll().stream()
            .filter(r -> r.getTenPhong().equals("Phòng 202"))
            .findFirst()
            .orElse(null);

        if (tenant3 != null && room202 != null) {
            boolean hasContract202 = contractRepository.findAll().stream()
                .anyMatch(c -> c.getKhachThue().getId().equals(tenant3.getId()) && c.getRoom().getId().equals(room202.getId()));
            if (!hasContract202) {
                Contract contract = Contract.builder()
                    .room(room202)
                    .khachThue(tenant3)
                    .ngayBatDau(LocalDate.of(2026, 3, 1))
                    .ngayKetThuc(LocalDate.of(2027, 2, 28))
                    .giaThue(room202.getGiaThue())
                    .tienCoc(room202.getGiaThue())
                    .soNguoiO(1)
                    .trangThai(Contract.TrangThai.HIEU_LUC)
                    .dichVu(services)
                    .kyDongTien(1)
                    .build();
                contractRepository.save(contract);
                
                room202.setTrangThai(Room.TrangThai.DA_THUE);
                roomRepository.save(room202);

                log.info("Seeded active contract for Room 202");

                // Seed Invoices (Mar to May paid, June unpaid)
                seedInvoiceIfNotExist(contract, up, 3, 2026, new BigDecimal("80"), new BigDecimal("190"), new BigDecimal("5"), new BigDecimal("12"), true);
                seedInvoiceIfNotExist(contract, up, 4, 2026, new BigDecimal("190"), new BigDecimal("310"), new BigDecimal("12"), new BigDecimal("20"), true);
                seedInvoiceIfNotExist(contract, up, 5, 2026, new BigDecimal("310"), new BigDecimal("440"), new BigDecimal("20"), new BigDecimal("29"), true);
                seedInvoiceIfNotExist(contract, up, 6, 2026, new BigDecimal("440"), new BigDecimal("440"), new BigDecimal("29"), new BigDecimal("29"), false);

                // Seed pending repair request
                RepairRequest req = RepairRequest.builder()
                    .hopDong(contract)
                    .moTa("Bồn cầu thoát nước rất chậm, có dấu hiệu tắc nghẽn")
                    .trangThai(RepairRequest.TrangThai.CHO_XU_LY)
                    .ngayGui(LocalDateTime.of(2026, 6, 25, 8, 15))
                    .build();
                repairRequestRepository.save(req);
            }
        }

        // ─── SEED FOR TENANT 4 (Phạm Hồng Đăng) ON ROOM 203 ───
        User tenant4 = userRepository.findBySoDienThoai("0933445566").orElse(null);
        Room room203 = roomRepository.findAll().stream()
            .filter(r -> r.getTenPhong().equals("Phòng 203"))
            .findFirst()
            .orElse(null);

        if (tenant4 != null && room203 != null) {
            boolean hasContract203 = contractRepository.findAll().stream()
                .anyMatch(c -> c.getKhachThue().getId().equals(tenant4.getId()) && c.getRoom().getId().equals(room203.getId()));
            if (!hasContract203) {
                Contract contract = Contract.builder()
                    .room(room203)
                    .khachThue(tenant4)
                    .ngayBatDau(LocalDate.of(2026, 4, 1))
                    .ngayKetThuc(LocalDate.of(2027, 3, 31))
                    .giaThue(room203.getGiaThue())
                    .tienCoc(room203.getGiaThue())
                    .soNguoiO(1)
                    .trangThai(Contract.TrangThai.HIEU_LUC)
                    .dichVu(services)
                    .kyDongTien(1)
                    .build();
                contractRepository.save(contract);
                
                room203.setTrangThai(Room.TrangThai.DA_THUE);
                roomRepository.save(room203);

                log.info("Seeded active contract for Room 203");

                // Seed Invoices (Apr to May paid, June unpaid)
                seedInvoiceIfNotExist(contract, up, 4, 2026, new BigDecimal("50"), new BigDecimal("130"), new BigDecimal("4"), new BigDecimal("11"), true);
                seedInvoiceIfNotExist(contract, up, 5, 2026, new BigDecimal("130"), new BigDecimal("240"), new BigDecimal("11"), new BigDecimal("19"), true);
                seedInvoiceIfNotExist(contract, up, 6, 2026, new BigDecimal("240"), new BigDecimal("240"), new BigDecimal("19"), new BigDecimal("19"), false);

                // Seed completed repair request
                RepairRequest req = RepairRequest.builder()
                    .hopDong(contract)
                    .moTa("Hỏng bản lề tủ quần áo gỗ")
                    .trangThai(RepairRequest.TrangThai.HOAN_THANH)
                    .chiPhi(new BigDecimal("80000"))
                    .ngayGui(LocalDateTime.of(2026, 4, 20, 14, 0))
                    .ngayCapNhat(LocalDateTime.of(2026, 4, 21, 16, 0))
                    .build();
                repairRequestRepository.save(req);
            }
        }

        // ─── SEED FOR TENANT 5 (Hoàng Mai Chi) ON ROOM 303 ───
        User tenant5 = userRepository.findBySoDienThoai("0944556677").orElse(null);
        Room room303 = roomRepository.findAll().stream()
            .filter(r -> r.getTenPhong().equals("Phòng 303"))
            .findFirst()
            .orElse(null);

        if (tenant5 != null && room303 != null) {
            boolean hasContract303 = contractRepository.findAll().stream()
                .anyMatch(c -> c.getKhachThue().getId().equals(tenant5.getId()) && c.getRoom().getId().equals(room303.getId()));
            if (!hasContract303) {
                Contract contract = Contract.builder()
                    .room(room303)
                    .khachThue(tenant5)
                    .ngayBatDau(LocalDate.of(2026, 5, 1))
                    .ngayKetThuc(LocalDate.of(2027, 4, 30))
                    .giaThue(room303.getGiaThue())
                    .tienCoc(room303.getGiaThue())
                    .soNguoiO(1)
                    .trangThai(Contract.TrangThai.HIEU_LUC)
                    .dichVu(services)
                    .kyDongTien(1)
                    .build();
                contractRepository.save(contract);
                
                room303.setTrangThai(Room.TrangThai.DA_THUE);
                roomRepository.save(room303);

                log.info("Seeded active contract for Room 303");

                // Seed Invoices (May paid, June unpaid)
                seedInvoiceIfNotExist(contract, up, 5, 2026, new BigDecimal("0"), new BigDecimal("85"), new BigDecimal("0"), new BigDecimal("8"), true);
                seedInvoiceIfNotExist(contract, up, 6, 2026, new BigDecimal("85"), new BigDecimal("85"), new BigDecimal("8"), new BigDecimal("8"), false);

                // Seed pending repair request
                RepairRequest req = RepairRequest.builder()
                    .hopDong(contract)
                    .moTa("Hệ thống thoát nước lavabo bị nghẹt nhẹ")
                    .trangThai(RepairRequest.TrangThai.CHO_XU_LY)
                    .ngayGui(LocalDateTime.of(2026, 6, 24, 18, 20))
                    .build();
                repairRequestRepository.save(req);
            }
        }

        // --- SEED FOR EXISTING TENANT 2 (0902345678) ON THEIR EXISTING ROOM/CONTRACT ---
        User tenantOld = userRepository.findBySoDienThoai("0902345678").orElse(null);
        if (tenantOld != null) {
            // Find active contract for this user
            Contract contractOld = contractRepository.findAll().stream()
                .filter(c -> c.getKhachThue().getId().equals(tenantOld.getId()) && c.getTrangThai() == Contract.TrangThai.HIEU_LUC)
                .findFirst()
                .orElse(null);

            if (contractOld != null) {
                log.info("Found active contract for tenant 0902345678: id={}, room={}", contractOld.getId(), contractOld.getRoom().getTenPhong());
                
                // Let's seed invoices for Feb, Mar, Apr, May 2026 if they don't exist
                seedInvoiceIfNotExist(contractOld, up, 2, 2026, new BigDecimal("150"), new BigDecimal("230"), new BigDecimal("20"), new BigDecimal("26"), true);
                seedInvoiceIfNotExist(contractOld, up, 3, 2026, new BigDecimal("230"), new BigDecimal("320"), new BigDecimal("26"), new BigDecimal("33"), true);
                seedInvoiceIfNotExist(contractOld, up, 4, 2026, new BigDecimal("320"), new BigDecimal("430"), new BigDecimal("33"), new BigDecimal("39"), true);
                seedInvoiceIfNotExist(contractOld, up, 5, 2026, new BigDecimal("430"), new BigDecimal("550"), new BigDecimal("39"), new BigDecimal("47"), true);
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
