package com.roomrental.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ServiceResponse(
    Long id,
    String tenDichVu,
    BigDecimal donGiaMacDinh,
    String donVi,
    LocalDateTime createdAt
) {}
