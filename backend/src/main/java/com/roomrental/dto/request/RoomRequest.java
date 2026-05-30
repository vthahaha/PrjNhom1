package com.roomrental.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record RoomRequest(
    @NotBlank(message = "Tên phòng không được để trống")
    String tenPhong,

    BigDecimal dienTich,
    Integer soNguoiToiDa,
    String tienNghi,

    @NotNull(message = "Giá thuê không được để trống")
    @Positive(message = "Giá thuê phải lớn hơn 0")
    BigDecimal giaThue
) {}
