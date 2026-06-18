package com.roomrental.service.impl;

import com.roomrental.dto.request.TenantRequest;
import com.roomrental.dto.request.UpdateMeRequest;
import com.roomrental.dto.response.ContractResponse;
import com.roomrental.dto.response.TenantResponse;
import com.roomrental.entity.Contract;
import com.roomrental.entity.User;
import com.roomrental.exception.BadRequestException;
import com.roomrental.exception.ResourceNotFoundException;
import com.roomrental.repository.ContractRepository;
import com.roomrental.repository.UserRepository;
import com.roomrental.service.FileStorageService;
import com.roomrental.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantServiceImpl implements TenantService {

    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;

    @Override
    public List<TenantResponse> getAll() {
        return userRepository.findAll().stream()
                .filter(u -> u.getVaiTro() == User.VaiTro.TENANT)
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public TenantResponse create(TenantRequest request) {
        if (userRepository.existsBySoDienThoai(request.soDienThoai())) {
            throw new BadRequestException("Số điện thoại đã tồn tại: " + request.soDienThoai());
        }
        // Mật khẩu tạm = 4 số cuối SĐT, tenant phải đổi khi đăng nhập lần đầu
        String tmpPassword = request.soDienThoai().substring(
                Math.max(0, request.soDienThoai().length() - 4));
        String email = (request.email() == null || request.email().isBlank()) ? null : request.email().trim();
        User user = User.builder()
                .hoTen(request.hoTen())
                .soDienThoai(request.soDienThoai())
                .email(email)
                .matKhau(passwordEncoder.encode(tmpPassword))
                .vaiTro(User.VaiTro.TENANT)
                .doiMkLanDau(true)
                .cccd(request.cccd())
                .queQuan(request.queQuan())
                .build();
        // TODO: gửi thông tin đăng nhập qua email (MailService)
        return toResponse(userRepository.save(user));
    }

    @Override
    public TenantResponse getById(Long id) {
        return toResponse(findTenant(id));
    }

    @Override
    @Transactional
    public TenantResponse update(Long id, TenantRequest request) {
        User user = findTenant(id);
        // Kiểm tra SĐT trùng (ngoại trừ chính user này)
        userRepository.findBySoDienThoai(request.soDienThoai())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new BadRequestException("Số điện thoại đã được dùng bởi tài khoản khác");
                    }
                });
        user.setHoTen(request.hoTen());
        user.setSoDienThoai(request.soDienThoai());
        String email = (request.email() == null || request.email().isBlank()) ? null : request.email().trim();
        user.setEmail(email);
        user.setCccd(request.cccd());
        user.setQueQuan(request.queQuan());
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        findTenant(id);
        if (contractRepository.existsByKhachThueIdAndTrangThai(id, Contract.TrangThai.HIEU_LUC)) {
            throw new BadRequestException("Không thể xóa khách đang có hợp đồng hiệu lực");
        }
        userRepository.deleteById(id);
    }

    @Override
    public List<ContractResponse> getContractHistory(Long id) {
        findTenant(id);
        return contractRepository.findAll().stream()
                .filter(c -> c.getKhachThue().getId().equals(id))
                .map(this::toContractResponse)
                .toList();
    }

    @Override
    public TenantResponse getMe(String soDienThoai) {
        User user = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        return toResponse(user);
    }

    @Override
    @Transactional
    public TenantResponse updateMe(String soDienThoai, UpdateMeRequest request) {
        User user = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        if (request.hoTen() != null) user.setHoTen(request.hoTen());
        if (request.email() != null) {
            String email = request.email().isBlank() ? null : request.email().trim();
            user.setEmail(email);
        }
        if (request.cccd() != null) user.setCccd(request.cccd());
        if (request.queQuan() != null) user.setQueQuan(request.queQuan());
        if (request.soDienThoai() != null && !request.soDienThoai().equals(soDienThoai)) {
            if (userRepository.existsBySoDienThoai(request.soDienThoai())) {
                throw new BadRequestException("Số điện thoại đã tồn tại");
            }
            user.setSoDienThoai(request.soDienThoai());
        }
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public TenantResponse updateAvatar(String soDienThoai, org.springframework.web.multipart.MultipartFile file) {
        User user = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));

        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isBlank()) {
            try {
                fileStorageService.deleteFile(user.getAvatarUrl());
            } catch (Exception e) {
                // Ignore delete error if file not found or minio offline
            }
        }

        String fileName = fileStorageService.uploadFile(file);
        user.setAvatarUrl(fileName);
        return toResponse(userRepository.save(user));
    }

    // -------- helpers --------

    private User findTenant(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khách thuê không tồn tại: " + id));
        if (user.getVaiTro() != User.VaiTro.TENANT) {
            throw new ResourceNotFoundException("Không tìm thấy khách thuê với id: " + id);
        }
        return user;
    }

    private TenantResponse toResponse(User user) {
        boolean coHopDong = contractRepository.existsByKhachThueIdAndTrangThai(
                user.getId(), Contract.TrangThai.HIEU_LUC);
        java.util.Optional<Contract> activeContractOpt = contractRepository.findTopByKhachThueIdAndTrangThaiOrderByNgayBatDauDesc(
                user.getId(), Contract.TrangThai.HIEU_LUC);
        String tenPhong = activeContractOpt.map(c -> c.getRoom().getTenPhong()).orElse(null);
        java.time.LocalDate ngayBatDauHopDong = activeContractOpt.map(Contract::getNgayBatDau).orElse(null);

        return new TenantResponse(user.getId(), user.getHoTen(), user.getSoDienThoai(),
                user.getEmail(), user.getVaiTro(), user.isDoiMkLanDau(),
                user.getCreatedAt(), coHopDong, user.getCccd(), user.getQueQuan(),
                tenPhong, ngayBatDauHopDong, fileStorageService.getPresignedUrl(user.getAvatarUrl()));
    }

    private ContractResponse toContractResponse(Contract c) {
        java.util.List<ContractResponse.DichVuInfo> dichVuInfos = c.getDichVu() == null ? java.util.List.of() :
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
                c.getKyDongTien(),
                dichVuInfos);
    }
}
