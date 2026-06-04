package com.roomrental.dto.response;

public record DashboardOverviewResponse(
    long phongTrong,
    long phongDaThue,
    long phongDangSua,
    long tongPhong,
    long hopDongHieuLuc,
    long hoaDonChuaTT,
    java.math.BigDecimal tongTienChuaTT
) {}
