package com.roomrental.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ContractExtensionRequestDto(
    @NotNull(message = "Ngày kết thúc mới không được để trống")
    java.time.LocalDate ngayKetThucMoi,
    
    String ghiChu
) {}
