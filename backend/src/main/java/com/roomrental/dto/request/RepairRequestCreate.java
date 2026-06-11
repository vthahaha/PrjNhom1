package com.roomrental.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record RepairRequestCreate(
    String moTa,
    
    List<String> csvcHieuHong,

    String anhUrl
) {}
