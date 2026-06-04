package com.roomrental.service.impl;

import com.roomrental.dto.request.ChangePasswordRequest;
import com.roomrental.dto.request.LoginRequest;
import com.roomrental.dto.request.RegisterRequest;
import com.roomrental.dto.response.AuthResponse;
import com.roomrental.entity.User;
import com.roomrental.exception.BadRequestException;
import com.roomrental.exception.ResourceNotFoundException;
import com.roomrental.repository.UserRepository;
import com.roomrental.security.JwtUtils;
import com.roomrental.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.findBySoDienThoai(request.soDienThoai()).isPresent()) {
            throw new BadRequestException("Số điện thoại đã được đăng ký");
        }
        
        User user = User.builder()
                .hoTen(request.hoTen())
                .soDienThoai(request.soDienThoai())
                .email(request.email())
                .matKhau(passwordEncoder.encode(request.matKhau()))
                .vaiTro(User.VaiTro.TENANT)
                .doiMkLanDau(false) // Tự đăng ký thì không bắt đổi mật khẩu nữa
                .build();
                
        userRepository.save(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.soDienThoai(), request.matKhau()));

        User user = userRepository.findBySoDienThoai(request.soDienThoai())
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));

        String token = jwtUtils.generateToken(user.getSoDienThoai());
        return new AuthResponse(token, user.getId(), user.getHoTen(),
                user.getSoDienThoai(), user.getVaiTro(), user.isDoiMkLanDau());
    }

    @Override
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findBySoDienThoai(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));

        if (!passwordEncoder.matches(request.matKhauCu(), user.getMatKhau())) {
            throw new BadRequestException("Mật khẩu cũ không đúng");
        }
        if (!request.matKhauMoi().equals(request.xacNhanMatKhau())) {
            throw new BadRequestException("Xác nhận mật khẩu không khớp");
        }
        user.setMatKhau(passwordEncoder.encode(request.matKhauMoi()));
        user.setDoiMkLanDau(false);
    }

    @Override
    public void forgotPassword(String email) {
        // TODO: generate reset token, send email via MailService
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // TODO: validate reset token, update password
    }

    @Override
    @Transactional
    public void firstLoginChange(String username, String newPassword) {
        if (newPassword == null || newPassword.length() < 8) {
            throw new BadRequestException("Mật khẩu mới tối thiểu 8 ký tự");
        }
        User user = userRepository.findBySoDienThoai(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        user.setMatKhau(passwordEncoder.encode(newPassword));
        user.setDoiMkLanDau(false);
    }
}
