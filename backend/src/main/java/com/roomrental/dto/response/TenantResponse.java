package com.roomrental.dto.response;

import com.roomrental.entity.User;

import java.time.LocalDateTime;

public record TenantResponse(
    Long id,
    String hoTen,
    String soDienThoai,
    String email,
    User.VaiTro vaiTro,
    boolean doiMkLanDau,
    LocalDateTime createdAt,
    boolean coHopDongHieuLuc,
    String cccd,
    String queQuan,
    String tenPhong,
    java.time.LocalDate ngayBatDauHopDong,
    String avatarUrl
) {}
