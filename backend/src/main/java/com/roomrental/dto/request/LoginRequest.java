package com.roomrental.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Số điện thoại không được để trống")
    String soDienThoai,

    @NotBlank(message = "Mật khẩu không được để trống")
    String matKhau
) {}
