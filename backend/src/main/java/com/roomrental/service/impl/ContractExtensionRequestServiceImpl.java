package com.roomrental.service.impl;

import com.roomrental.dto.request.ContractExtensionRequestDto;
import com.roomrental.dto.response.ContractExtensionRequestResponse;
import com.roomrental.entity.*;
import com.roomrental.exception.BadRequestException;
import com.roomrental.exception.ResourceNotFoundException;
import com.roomrental.repository.*;
import com.roomrental.service.ContractExtensionRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractExtensionRequestServiceImpl implements ContractExtensionRequestService {

    private final ContractExtensionRequestRepository requestRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public ContractExtensionRequestResponse createRequest(String soDienThoai, ContractExtensionRequestDto requestDto) {
        User tenant = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new ResourceNotFoundException("Khách thuê không tồn tại"));

        Contract contract = contractRepository.findTopByKhachThueIdAndTrangThaiOrderByNgayBatDauDesc(
                tenant.getId(), Contract.TrangThai.HIEU_LUC)
                .orElseThrow(() -> new BadRequestException("Bạn không có hợp đồng hiệu lực nào để yêu cầu gia hạn"));

        ContractExtensionRequest request = ContractExtensionRequest.builder()
                .contract(contract)
                .tenant(tenant)
                .soThangGiaHan(requestDto.soThangGiaHan())
                .ghiChu(requestDto.ghiChu())
                .trangThai(ContractExtensionRequest.TrangThai.PENDING)
                .build();

        ContractExtensionRequest saved = requestRepository.save(request);

        // Tạo thông báo cho admin
        String msg = String.format("Khách thuê %s đã gửi yêu cầu gia hạn hợp đồng phòng %s thêm %d tháng.",
                tenant.getHoTen(), contract.getRoom().getTenPhong(), requestDto.soThangGiaHan());
        Notification notification = Notification.builder()
                .noiDung(msg)
                .daDoc(false)
                .forAdmin(true)
                .build();
        notificationRepository.save(notification);

        log.info("Created extension request ID {} and admin notification", saved.getId());
        return toResponse(saved);
    }

    @Override
    public List<ContractExtensionRequestResponse> getTenantRequests(String soDienThoai) {
        User tenant = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new ResourceNotFoundException("Khách thuê không tồn tại"));
        return requestRepository.findByTenantIdOrderByCreatedAtDesc(tenant.getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<ContractExtensionRequestResponse> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public ContractExtensionRequestResponse approveRequest(Long requestId) {
        ContractExtensionRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu gia hạn không tồn tại"));

        if (req.getTrangThai() != ContractExtensionRequest.TrangThai.PENDING) {
            throw new BadRequestException("Chỉ có thể phê duyệt yêu cầu ở trạng thái PENDING");
        }

        req.setTrangThai(ContractExtensionRequest.TrangThai.APPROVED);
        Contract contract = req.getContract();
        LocalDate oldEnd = contract.getNgayKetThuc();
        LocalDate newEnd = oldEnd.plusMonths(req.getSoThangGiaHan());
        contract.setNgayKetThuc(newEnd);
        contractRepository.save(contract);
        
        ContractExtensionRequest saved = requestRepository.save(req);

        // Thêm thông báo cho tenant
        String msg = String.format("Yêu cầu gia hạn hợp đồng phòng %s thêm %d tháng đã được PHÊ DUYỆT. Hạn mới: %s",
                contract.getRoom().getTenPhong(), req.getSoThangGiaHan(), newEnd.toString());
        Notification notification = Notification.builder()
                .noiDung(msg)
                .daDoc(false)
                .forAdmin(false) // Gửi cho tenant
                .build();
        notificationRepository.save(notification);

        log.info("Approved extension request ID {}, contract end date extended from {} to {}", requestId, oldEnd, newEnd);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ContractExtensionRequestResponse rejectRequest(Long requestId) {
        ContractExtensionRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu gia hạn không tồn tại"));

        if (req.getTrangThai() != ContractExtensionRequest.TrangThai.PENDING) {
            throw new BadRequestException("Chỉ có thể từ chối yêu cầu ở trạng thái PENDING");
        }

        req.setTrangThai(ContractExtensionRequest.TrangThai.REJECTED);
        ContractExtensionRequest saved = requestRepository.save(req);

        // Thêm thông báo cho tenant
        String msg = String.format("Yêu cầu gia hạn hợp đồng phòng %s thêm %d tháng đã bị TỪ CHỐI.",
                req.getContract().getRoom().getTenPhong(), req.getSoThangGiaHan());
        Notification notification = Notification.builder()
                .noiDung(msg)
                .daDoc(false)
                .forAdmin(false)
                .build();
        notificationRepository.save(notification);

        log.info("Rejected extension request ID {}", requestId);
        return toResponse(saved);
    }

    private ContractExtensionRequestResponse toResponse(ContractExtensionRequest req) {
        return new ContractExtensionRequestResponse(
                req.getId(),
                req.getContract().getId(),
                req.getContract().getRoom().getTenPhong(),
                req.getTenant().getId(),
                req.getTenant().getHoTen(),
                req.getSoThangGiaHan(),
                req.getGhiChu(),
                req.getTrangThai(),
                req.getCreatedAt(),
                req.getUpdatedAt()
        );
    }
}
