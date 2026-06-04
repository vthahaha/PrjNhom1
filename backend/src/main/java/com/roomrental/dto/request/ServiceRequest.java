package com.roomrental.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ServiceRequest(
    @NotBlank(message = "Tên dịch vụ không được để trống")
    @Size(max = 100)
    String tenDichVu,

    @NotNull(message = "Đơn giá mặc định không được để trống")
    @Positive(message = "Đơn giá phải lớn hơn 0")
    BigDecimal donGiaMacDinh,

    @Size(max = 50)
    String donVi
) {}
