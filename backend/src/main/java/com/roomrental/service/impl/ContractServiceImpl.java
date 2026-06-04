package com.roomrental.service.impl;

import com.roomrental.dto.request.ContractRenewRequest;
import com.roomrental.dto.request.ContractRequest;
import com.roomrental.dto.request.ContractTerminateRequest;
import com.roomrental.dto.response.ContractResponse;
import com.roomrental.entity.Contract;
import com.roomrental.entity.Room;
import com.roomrental.entity.User;
import com.roomrental.exception.BadRequestException;
import com.roomrental.exception.ResourceNotFoundException;
import com.roomrental.repository.ContractRepository;
import com.roomrental.repository.RoomRepository;
import com.roomrental.repository.UserRepository;
import com.roomrental.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Override
    public List<ContractResponse> getAll(Contract.TrangThai trangThai) {
        List<Contract> list = (trangThai != null)
                ? contractRepository.findByTrangThai(trangThai)
                : contractRepository.findAll();
        return list.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public ContractResponse create(ContractRequest request) {
        Room room = roomRepository.findById(request.phongId())
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại: " + request.phongId()));
        if (room.getTrangThai() != Room.TrangThai.TRONG) {
            throw new BadRequestException("Phòng hiện không trống, không thể tạo hợp đồng");
        }
        if (contractRepository.existsByRoomIdAndTrangThai(request.phongId(), Contract.TrangThai.HIEU_LUC)) {
            throw new BadRequestException("Phòng đang có hợp đồng hiệu lực");
        }
        User khach = userRepository.findById(request.khachThueId())
                .orElseThrow(() -> new ResourceNotFoundException("Khách thuê không tồn tại: " + request.khachThueId()));
        if (request.ngayBatDau().isAfter(request.ngayKetThuc())) {
            throw new BadRequestException("Ngày bắt đầu phải trước ngày kết thúc");
        }
        Contract contract = Contract.builder()
                .room(room)
                .khachThue(khach)
                .ngayBatDau(request.ngayBatDau())
                .ngayKetThuc(request.ngayKetThuc())
                .giaThue(request.giaThue())
                .tienCoc(request.tienCoc() != null ? request.tienCoc() : BigDecimal.ZERO)
                .trangThai(Contract.TrangThai.HIEU_LUC)
                .build();
        room.setTrangThai(Room.TrangThai.DA_THUE);
        roomRepository.save(room);
        return toResponse(contractRepository.save(contract));
    }

    @Override
    public ContractResponse getById(Long id) {
        return toResponse(findContract(id));
    }

    @Override
    @Transactional
    public ContractResponse terminate(Long id, ContractTerminateRequest request) {
        Contract contract = findContract(id);
        if (contract.getTrangThai() != Contract.TrangThai.HIEU_LUC) {
            throw new BadRequestException("Chỉ có thể kết thúc hợp đồng đang hiệu lực");
        }
        contract.setTrangThai(Contract.TrangThai.CHAM_DUT);
        contract.setLyDoChamDut(request.lyDoChamDut());
        contract.setNgayTraPhong(request.ngayTraPhong());
        // Cập nhật phòng về trạng thái trống
        Room room = contract.getRoom();
        room.setTrangThai(Room.TrangThai.TRONG);
        roomRepository.save(room);
        return toResponse(contractRepository.save(contract));
    }

    @Override
    @Transactional
    public ContractResponse renew(Long id, ContractRenewRequest request) {
        Contract contract = findContract(id);
        if (contract.getTrangThai() != Contract.TrangThai.HIEU_LUC) {
            throw new BadRequestException("Chỉ có thể gia hạn hợp đồng đang hiệu lực");
        }
        if (request.ngayKetThucMoi().isBefore(contract.getNgayKetThuc())) {
            throw new BadRequestException("Ngày kết thúc mới phải sau ngày kết thúc hiện tại");
        }
        contract.setNgayKetThuc(request.ngayKetThucMoi());
        if (request.giaTheuMoi() != null) {
            contract.setGiaThue(request.giaTheuMoi());
        }
        return toResponse(contractRepository.save(contract));
    }

    @Override
    public List<ContractResponse> getExpiringSoon() {
        LocalDate today = LocalDate.now();
        LocalDate in30 = today.plusDays(30);
        return contractRepository.findExpiringSoon(today, in30)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public ContractResponse getMyContract(String soDienThoai) {
        User user = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        return contractRepository.findTopByKhachThueIdAndTrangThaiOrderByNgayBatDauDesc(
                        user.getId(), Contract.TrangThai.HIEU_LUC)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn không có hợp đồng hiệu lực"));
    }

    // -------- helpers --------

    private Contract findContract(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hợp đồng không tồn tại: " + id));
    }

    ContractResponse toResponse(Contract c) {
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
