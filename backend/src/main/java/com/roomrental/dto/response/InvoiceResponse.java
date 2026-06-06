package com.roomrental.dto.response;

import com.roomrental.entity.Invoice;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InvoiceResponse(
    Long id,
    Long hopDongId,
    Long phongId,
    String tenPhong,
    Long utilityPriceId,
    Integer thang,
    Integer nam,
    BigDecimal chiSoDienDau,
    BigDecimal chiSoDienCuoi,
    BigDecimal chiSoNuocDau,
    BigDecimal chiSoNuocCuoi,
    BigDecimal phiKhac,
    String ghiChuPhiKhac,
    BigDecimal tongTien,
    Integer soNguoiO,
    Invoice.TrangThai trangThai,
    LocalDateTime ngayThanhToan,
    LocalDateTime createdAt
) {}
