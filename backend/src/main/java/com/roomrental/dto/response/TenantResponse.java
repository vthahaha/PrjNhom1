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
    boolean coHopDongHieuLuc   // trạng thái hợp đồng hiện tại
) {}
