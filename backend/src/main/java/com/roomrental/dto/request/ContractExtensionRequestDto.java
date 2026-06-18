package com.roomrental.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ContractExtensionRequestDto(
    @NotNull(message = "Số tháng gia hạn không được để trống")
    @Min(value = 1, message = "Số tháng gia hạn tối thiểu là 1 tháng")
    Integer soThangGiaHan,
    
    String ghiChu
) {}
