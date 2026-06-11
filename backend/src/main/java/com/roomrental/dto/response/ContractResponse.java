package com.roomrental.dto.response;

import com.roomrental.entity.Contract;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ContractResponse(
    Long id,
    Long phongId,
    String tenPhong,
    Long khachThueId,
    String hoTenKhach,
    String soDienThoaiKhach,
    LocalDate ngayBatDau,
    LocalDate ngayKetThuc,
    BigDecimal giaThue,
    BigDecimal tienCoc,
    Contract.TrangThai trangThai,
    Integer soNguoiO,
    String lyDoChamDut,
    LocalDate ngayTraPhong,
    LocalDateTime createdAt,
    String tienNghi,
    String fileHopDongUrl
) {}
