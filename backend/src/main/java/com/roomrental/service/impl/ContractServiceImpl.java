package com.roomrental.service.impl;

import com.roomrental.dto.request.ContractRenewRequest;
import com.roomrental.dto.request.ContractRequest;
import com.roomrental.dto.request.ContractTerminateRequest;
import com.roomrental.dto.response.ContractResponse;
import com.roomrental.entity.Contract;
import com.roomrental.entity.Room;
import com.roomrental.entity.Service;
import com.roomrental.entity.User;
import com.roomrental.exception.BadRequestException;
import com.roomrental.exception.ResourceNotFoundException;
import com.roomrental.repository.ContractRepository;
import com.roomrental.repository.RoomRepository;
import com.roomrental.repository.ServiceRepository;
import com.roomrental.repository.UserRepository;
import com.roomrental.service.ContractService;
import com.roomrental.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final FileStorageService fileStorageService;

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
        if (room.getTrangThai() == Room.TrangThai.DANG_SUA) {
            throw new BadRequestException("Phòng đang sửa, không thể tạo hợp đồng");
        }
        List<Contract> activeContracts = contractRepository.findByRoomIdAndTrangThai(request.phongId(), Contract.TrangThai.HIEU_LUC);
        int currentOccupants = activeContracts.stream().mapToInt(Contract::getSoNguoiO).sum();
        int newOccupants = request.soNguoiO() != null ? request.soNguoiO() : 1;
        int maxOccupants = room.getSoNguoiToiDa() != null ? room.getSoNguoiToiDa() : 2;

        if (currentOccupants + newOccupants > maxOccupants) {
            throw new BadRequestException("Phòng không đủ chỗ cho số người đăng ký mới (Hiện tại: " + currentOccupants + "/" + maxOccupants + " người)");
        }
        if (contractRepository.existsByKhachThueIdAndTrangThai(request.khachThueId(), Contract.TrangThai.HIEU_LUC)) {
            throw new BadRequestException("Khách thuê này đang có hợp đồng hiệu lực ở một phòng khác");
        }
        User khach = userRepository.findById(request.khachThueId())
                .orElseThrow(() -> new ResourceNotFoundException("Khách thuê không tồn tại: " + request.khachThueId()));
        if (request.ngayBatDau().isAfter(request.ngayKetThuc())) {
            throw new BadRequestException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        // Lấy danh sách dịch vụ được chọn
        List<Service> selectedServices = new ArrayList<>();
        if (request.dichVuIds() != null && !request.dichVuIds().isEmpty()) {
            selectedServices = serviceRepository.findAllById(request.dichVuIds());
        }

        Contract contract = Contract.builder()
                .room(room)
                .khachThue(khach)
                .ngayBatDau(request.ngayBatDau())
                .ngayKetThuc(request.ngayKetThuc())
                .giaThue(request.giaThue())
                .tienCoc(request.tienCoc() != null ? request.tienCoc() : BigDecimal.ZERO)
                .soNguoiO(request.soNguoiO() != null ? request.soNguoiO() : 1)
                .trangThai(Contract.TrangThai.HIEU_LUC)
                .dichVu(selectedServices)
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
        // Cập nhật phòng về trạng thái trống nếu không còn hợp đồng hiệu lực nào khác
        Room room = contract.getRoom();
        List<Contract> otherActive = contractRepository.findByRoomIdAndTrangThai(room.getId(), Contract.TrangThai.HIEU_LUC);
        long remainingActiveCount = otherActive.stream().filter(c -> !c.getId().equals(id)).count();
        if (remainingActiveCount == 0) {
            room.setTrangThai(Room.TrangThai.TRONG);
        } else {
            room.setTrangThai(Room.TrangThai.DA_THUE);
        }
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

    @Override
    @Transactional
    public ContractResponse uploadDocument(Long id, org.springframework.web.multipart.MultipartFile file) {
        Contract contract = findContract(id);
        if (contract.getFileHopDongUrl() != null) {
            fileStorageService.deleteFile(contract.getFileHopDongUrl());
        }
        String filename = fileStorageService.uploadFile(file);
        contract.setFileHopDongUrl(filename);
        return toResponse(contractRepository.save(contract));
    }

    @Override
    @Transactional
    public ContractResponse deleteDocument(Long id) {
        Contract contract = findContract(id);
        if (contract.getFileHopDongUrl() != null) {
            fileStorageService.deleteFile(contract.getFileHopDongUrl());
            contract.setFileHopDongUrl(null);
            contractRepository.save(contract);
        }
        return toResponse(contract);
    }

    // -------- helpers --------

    private Contract findContract(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hợp đồng không tồn tại: " + id));
    }

    ContractResponse toResponse(Contract c) {
        List<ContractResponse.DichVuInfo> dichVuInfos = c.getDichVu() == null ? List.of() :
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
                dichVuInfos);
    }
}
