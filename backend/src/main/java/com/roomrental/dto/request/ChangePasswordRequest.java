package com.roomrental.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    @NotBlank String matKhauCu,

    @NotBlank @Size(min = 8, message = "Mật khẩu mới tối thiểu 8 ký tự")
    String matKhauMoi,

    @NotBlank String xacNhanMatKhau
) {}
