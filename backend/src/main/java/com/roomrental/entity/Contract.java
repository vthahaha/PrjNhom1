package com.roomrental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "contract")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phong_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khach_thue_id", nullable = false)
    private User khachThue;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate ngayKetThuc;

    @Column(name = "gia_thue", nullable = false, precision = 12, scale = 0)
    private BigDecimal giaThue;

    @Column(name = "tien_coc", nullable = false, precision = 12, scale = 0)
    private BigDecimal tienCoc = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThai trangThai = TrangThai.HIEU_LUC;

    @Column(name = "so_nguoi_o", nullable = false)
    private Integer soNguoiO = 1;

    @Column(name = "ly_do_cham_dut", columnDefinition = "TEXT")
    private String lyDoChamDut;

    @Column(name = "ngay_tra_phong")
    private LocalDate ngayTraPhong;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum TrangThai { HIEU_LUC, HET_HAN, CHAM_DUT }
}
