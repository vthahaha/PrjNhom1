package com.roomrental.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ContractRequest(
    @NotNull(message = "Phòng không được để trống")
    Long phongId,

    @NotNull(message = "Khách thuê không được để trống")
    Long khachThueId,

    @NotNull(message = "Ngày bắt đầu không được để trống")
    LocalDate ngayBatDau,

    @NotNull(message = "Ngày kết thúc không được để trống")
    LocalDate ngayKetThuc,

    @NotNull(message = "Giá thuê không được để trống")
    @Positive(message = "Giá thuê phải lớn hơn 0")
    BigDecimal giaThue,

    BigDecimal tienCoc,

    @Positive(message = "Số người ở phải lớn hơn 0")
    Integer soNguoiO,

    Integer kyDongTien,

    /** Danh sách ID dịch vụ đăng ký theo hợp đồng (optional) */
    List<Long> dichVuIds
) {}
