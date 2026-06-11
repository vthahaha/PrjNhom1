package com.roomrental.config;

import com.roomrental.entity.Room;
import com.roomrental.entity.RoomService;
import com.roomrental.entity.Service;
import com.roomrental.repository.RoomRepository;
import com.roomrental.repository.RoomServiceRepository;
import com.roomrental.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
        assignServicesToAllRooms();
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

    private record ServiceSeed(String ten, BigDecimal donGia, String donVi) {}
}
