package com.roomrental.dto.response;

import com.roomrental.entity.User;

public record AuthResponse(
    String token,
    String type,
    Long id,
    String hoTen,
    String soDienThoai,
    User.VaiTro vaiTro,
    boolean doiMkLanDau
) {
    public AuthResponse(String token, Long id, String hoTen, String soDienThoai,
                        User.VaiTro vaiTro, boolean doiMkLanDau) {
        this(token, "Bearer", id, hoTen, soDienThoai, vaiTro, doiMkLanDau);
    }
}
