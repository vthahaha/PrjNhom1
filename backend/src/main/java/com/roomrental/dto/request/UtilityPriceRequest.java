package com.roomrental.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UtilityPriceRequest(
    @NotNull(message = "Đơn giá điện không được để trống")
    @Positive(message = "Đơn giá điện phải lớn hơn 0")
    BigDecimal donGiaDien,

    @NotNull(message = "Đơn giá nước không được để trống")
    @Positive(message = "Đơn giá nước phải lớn hơn 0")
    BigDecimal donGiaNuoc,

    @NotNull(message = "Ngày áp dụng không được để trống")
    LocalDate apDungTu,

    String ghiChu
) {}
