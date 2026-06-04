package com.roomrental.dto.response;

import java.math.BigDecimal;

public record RoomServiceResponse(
    Long id,
    Long dichVuId,
    String tenDichVu,
    String donVi,
    BigDecimal donGiaMacDinh,
    BigDecimal donGiaOverride,   // null nếu dùng giá mặc định
    BigDecimal donGiaApDung      // giá thực áp dụng = override ?? macDinh
) {}
