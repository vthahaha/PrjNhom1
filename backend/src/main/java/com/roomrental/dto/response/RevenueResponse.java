package com.roomrental.dto.response;

import java.math.BigDecimal;

public record RevenueResponse(
    int thang,
    BigDecimal doanhThu
) {}
