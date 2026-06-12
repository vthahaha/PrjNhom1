package com.roomrental.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TenantRequest(
    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100)
    String hoTen,

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)\\d{9,10}$", message = "Số điện thoại không hợp lệ")
    String soDienThoai,

    @Email(message = "Email không hợp lệ")
    String email,
    
    @NotBlank(message = "CCCD không được để trống")
    @Pattern(regexp = "^\\d{9,12}$", message = "CCCD không hợp lệ (phải gồm 9-12 chữ số)")
    String cccd,

    String queQuan
) {}
