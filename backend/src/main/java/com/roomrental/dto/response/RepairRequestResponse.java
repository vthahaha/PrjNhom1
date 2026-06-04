package com.roomrental.dto.response;

import com.roomrental.entity.RepairRequest;

import java.time.LocalDateTime;

public record RepairRequestResponse(
    Long id,
    Long hopDongId,
    Long phongId,
    String tenPhong,
    Long khachThueId,
    String hoTenKhach,
    String moTa,
    String anhUrl,
    RepairRequest.TrangThai trangThai,
    LocalDateTime ngayGui,
    LocalDateTime ngayCapNhat
) {}
