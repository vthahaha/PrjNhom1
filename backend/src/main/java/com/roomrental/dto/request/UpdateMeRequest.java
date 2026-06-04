package com.roomrental.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateMeRequest(
    @Size(max = 100)
    String hoTen,

    @Pattern(regexp = "^(0|\\+84)\\d{9,10}$", message = "Số điện thoại không hợp lệ")
    String soDienThoai,

    @Email(message = "Email không hợp lệ")
    String email
) {}
