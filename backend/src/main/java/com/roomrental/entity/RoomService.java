package com.roomrental.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "room_service",
    uniqueConstraints = @UniqueConstraint(columnNames = {"phong_id", "dich_vu_id"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RoomService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phong_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dich_vu_id", nullable = false)
    private Service service;

    /**
     * Đơn giá ghi đè riêng cho phòng này.
     * Nếu null → dùng donGiaMacDinh của Service.
     */
    @Column(name = "don_gia_override", precision = 12, scale = 0)
    private BigDecimal donGiaOverride;

    @Column(name = "so_luong", nullable = false)
    @Builder.Default
    private Integer soLuong = 1;
}
