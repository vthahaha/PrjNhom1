package com.roomrental.dto.request;

import jakarta.validation.constraints.NotBlank;

public record RepairRequestCreate(
    @NotBlank(message = "Mô tả không được để trống")
    String moTa,

    String anhUrl
) {}
