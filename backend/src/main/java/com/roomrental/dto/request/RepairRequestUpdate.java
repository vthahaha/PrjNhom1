package com.roomrental.dto.request;

import com.roomrental.entity.RepairRequest;

import java.math.BigDecimal;

public record RepairRequestUpdate(
    RepairRequest.TrangThai trangThai,
    BigDecimal chiPhi
) {}
