package com.roomrental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "room")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_phong", nullable = false, unique = true, length = 50)
    private String tenPhong;

    @Column(name = "dien_tich", precision = 6, scale = 2)
    private BigDecimal dienTich;

    @Column(name = "so_nguoi_toi_da")
    private Integer soNguoiToiDa = 2;

    @Column(name = "tien_nghi", columnDefinition = "TEXT")
    private String tienNghi;

    @Column(name = "gia_thue", nullable = false, precision = 12, scale = 0)
    private BigDecimal giaThue;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThai trangThai = TrangThai.TRONG;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum TrangThai { TRONG, DA_THUE, DANG_SUA }
}
