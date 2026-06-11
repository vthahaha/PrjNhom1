package com.roomrental.service.impl;

import com.roomrental.dto.request.RepairRequestCreate;
import com.roomrental.dto.response.RepairRequestResponse;
import com.roomrental.entity.Contract;
import com.roomrental.entity.RepairRequest;
import com.roomrental.entity.User;
import com.roomrental.exception.BadRequestException;
import com.roomrental.exception.ResourceNotFoundException;
import com.roomrental.repository.ContractRepository;
import com.roomrental.repository.RepairRequestRepository;
import com.roomrental.repository.UserRepository;
import com.roomrental.service.RepairRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RepairRequestServiceImpl implements RepairRequestService {

    private final RepairRequestRepository repairRequestRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public RepairRequestResponse create(String soDienThoai, RepairRequestCreate request) {
        User user = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        Contract contract = contractRepository
                .findTopByKhachThueIdAndTrangThaiOrderByNgayBatDauDesc(user.getId(), Contract.TrangThai.HIEU_LUC)
                .orElseThrow(() -> new BadRequestException("Bạn không có hợp đồng hiệu lực để gửi yêu cầu"));
        String csvc = (request.csvcHieuHong() != null && !request.csvcHieuHong().isEmpty()) 
                ? String.join(", ", request.csvcHieuHong()) : null;
        String moTa = request.moTa() != null ? request.moTa() : "";

        RepairRequest rr = RepairRequest.builder()
                .hopDong(contract)
                .moTa(moTa)
                .anhUrl(request.anhUrl())
                .csvcHieuHong(csvc)
                .trangThai(RepairRequest.TrangThai.CHO_XU_LY)
                .build();
        return toResponse(repairRequestRepository.save(rr));
    }

    @Override
    public List<RepairRequestResponse> getAll(Long phongId, LocalDateTime tuNgay, LocalDateTime denNgay) {
        return repairRequestRepository.findByFilter(phongId, tuNgay, denNgay)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public RepairRequestResponse update(Long id, com.roomrental.dto.request.RepairRequestUpdate request) {
        RepairRequest rr = repairRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu không tồn tại: " + id));
        if (request.trangThai() != null) {
            rr.setTrangThai(request.trangThai());
        }
        if (request.chiPhi() != null) {
            rr.setChiPhi(request.chiPhi());
        }
        return toResponse(repairRequestRepository.save(rr));
    }

    @Override
    public List<RepairRequestResponse> getMyRequests(String soDienThoai) {
        User user = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        return repairRequestRepository.findByHopDongKhachThueId(user.getId())
                .stream().map(this::toResponse).toList();
    }

    // -------- helpers --------

    private RepairRequestResponse toResponse(RepairRequest rr) {
        return new RepairRequestResponse(
                rr.getId(),
                rr.getHopDong().getId(),
                rr.getHopDong().getRoom().getId(),
                rr.getHopDong().getRoom().getTenPhong(),
                rr.getHopDong().getKhachThue().getId(),
                rr.getHopDong().getKhachThue().getHoTen(),
                rr.getMoTa(), rr.getAnhUrl(), rr.getCsvcHieuHong(),
                rr.getTrangThai(), rr.getNgayGui(), rr.getNgayCapNhat(), rr.getChiPhi());
    }
}
