package com.roomrental.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UtilityPriceResponse(
    Long id,
    BigDecimal donGiaDien,
    BigDecimal donGiaNuoc,
    LocalDate apDungTu,
    String ghiChu
) {}
