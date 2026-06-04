package com.roomrental.service.impl;

import com.roomrental.dto.request.RoomServiceRequest;
import com.roomrental.dto.request.ServiceRequest;
import com.roomrental.dto.response.RoomServiceResponse;
import com.roomrental.dto.response.ServiceResponse;
import com.roomrental.entity.Room;
import com.roomrental.entity.RoomService;
import com.roomrental.entity.Service;
import com.roomrental.exception.BadRequestException;
import com.roomrental.exception.ResourceNotFoundException;
import com.roomrental.repository.RoomRepository;
import com.roomrental.repository.RoomServiceRepository;
import com.roomrental.repository.ServiceRepository;
import com.roomrental.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;
    private final RoomServiceRepository roomServiceRepository;
    private final RoomRepository roomRepository;

    @Override
    public List<ServiceResponse> getAll() {
        return serviceRepository.findAll().stream().map(this::toServiceResponse).toList();
    }

    @Override
    @Transactional
    public ServiceResponse create(ServiceRequest request) {
        if (serviceRepository.existsByTenDichVu(request.tenDichVu())) {
            throw new BadRequestException("Tên dịch vụ đã tồn tại: " + request.tenDichVu());
        }
        Service svc = Service.builder()
                .tenDichVu(request.tenDichVu())
                .donGiaMacDinh(request.donGiaMacDinh())
                .donVi(request.donVi())
                .build();
        return toServiceResponse(serviceRepository.save(svc));
    }

    @Override
    @Transactional
    public ServiceResponse update(Long id, ServiceRequest request) {
        Service svc = findService(id);
        // Kiểm tra trùng tên (ngoại trừ chính nó)
        serviceRepository.findAll().stream()
                .filter(s -> s.getTenDichVu().equalsIgnoreCase(request.tenDichVu()) && !s.getId().equals(id))
                .findFirst()
                .ifPresent(s -> { throw new BadRequestException("Tên dịch vụ đã tồn tại"); });
        svc.setTenDichVu(request.tenDichVu());
        svc.setDonGiaMacDinh(request.donGiaMacDinh());
        svc.setDonVi(request.donVi());
        return toServiceResponse(serviceRepository.save(svc));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        findService(id);
        serviceRepository.deleteById(id);
    }

    @Override
    public List<RoomServiceResponse> getRoomServices(Long roomId) {
        findRoom(roomId);
        return roomServiceRepository.findByRoomId(roomId)
                .stream().map(this::toRoomServiceResponse).toList();
    }

    @Override
    @Transactional
    public List<RoomServiceResponse> updateRoomServices(Long roomId, RoomServiceRequest request) {
        Room room = findRoom(roomId);
        // Xóa hết gán cũ, thêm lại toàn bộ
        roomServiceRepository.deleteByRoomId(roomId);
        List<RoomService> saved = request.items().stream().map(item -> {
            Service svc = findService(item.dichVuId());
            return roomServiceRepository.save(RoomService.builder()
                    .room(room)
                    .service(svc)
                    .donGiaOverride(item.donGiaOverride())
                    .build());
        }).toList();
        return saved.stream().map(this::toRoomServiceResponse).toList();
    }

    // -------- helpers --------

    private Service findService(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dịch vụ không tồn tại: " + id));
    }

    private Room findRoom(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại: " + id));
    }

    private ServiceResponse toServiceResponse(Service s) {
        return new ServiceResponse(s.getId(), s.getTenDichVu(),
                s.getDonGiaMacDinh(), s.getDonVi(), s.getCreatedAt());
    }

    private RoomServiceResponse toRoomServiceResponse(RoomService rs) {
        BigDecimal apDung = rs.getDonGiaOverride() != null
                ? rs.getDonGiaOverride()
                : rs.getService().getDonGiaMacDinh();
        return new RoomServiceResponse(
                rs.getId(),
                rs.getService().getId(),
                rs.getService().getTenDichVu(),
                rs.getService().getDonVi(),
                rs.getService().getDonGiaMacDinh(),
                rs.getDonGiaOverride(),
                apDung);
    }
}
