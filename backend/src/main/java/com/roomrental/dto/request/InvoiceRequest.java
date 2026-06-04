package com.roomrental.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InvoiceRequest(
    @NotNull(message = "Hợp đồng không được để trống")
    Long hopDongId,

    Long utilityPriceId,

    @NotNull(message = "Tháng không được để trống")
    Integer thang,

    @NotNull(message = "Năm không được để trống")
    Integer nam,

    BigDecimal chiSoDienDau,
    BigDecimal chiSoDienCuoi,
    BigDecimal chiSoNuocDau,
    BigDecimal chiSoNuocCuoi,

    BigDecimal phiKhac,
    String ghiChuPhiKhac
) {}
