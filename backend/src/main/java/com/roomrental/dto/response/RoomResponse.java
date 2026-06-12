package com.roomrental.dto.response;

import com.roomrental.entity.Room;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RoomResponse(
    Long id,
    String tenPhong,
    BigDecimal dienTich,
    Integer soNguoiToiDa,
    String tienNghi,
    BigDecimal giaThue,
    Room.TrangThai trangThai,
    LocalDateTime createdAt,
    Integer soNguoiDaO
) {
    public RoomResponse(Long id, String tenPhong, BigDecimal dienTich,
                        Integer soNguoiToiDa, String tienNghi, BigDecimal giaThue,
                        Room.TrangThai trangThai, LocalDateTime createdAt) {
        this(id, tenPhong, dienTich, soNguoiToiDa, tienNghi, giaThue, trangThai, createdAt, 0);
    }
}
