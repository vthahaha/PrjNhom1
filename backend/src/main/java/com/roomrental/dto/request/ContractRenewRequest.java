package com.roomrental.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContractRenewRequest(
    @NotNull(message = "Ngày kết thúc mới không được để trống")
    LocalDate ngayKetThucMoi,

    @Positive(message = "Giá thuê mới phải lớn hơn 0")
    BigDecimal giaTheuMoi
) {}
