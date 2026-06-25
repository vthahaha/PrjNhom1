package com.roomrental.dto.request;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record RoomServiceRequest(
    @NotNull(message = "Danh sách dịch vụ không được null")
    List<Item> items
) {
    public record Item(
        @NotNull Long dichVuId,
        BigDecimal donGiaOverride,   // null → dùng đơn giá mặc định
        Integer soLuong
    ) {}
}
