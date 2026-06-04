package com.roomrental.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record ContractTerminateRequest(
    @NotNull(message = "Ngày trả phòng không được để trống")
    LocalDate ngayTraPhong,

    String lyDoChamDut
) {}
