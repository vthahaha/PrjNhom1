package com.roomrental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice",
    uniqueConstraints = @UniqueConstraint(columnNames = {"hop_dong_id", "thang", "nam"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hop_dong_id", nullable = false)
    private Contract hopDong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utility_price_id")
    private UtilityPrice utilityPrice;

    @Column(name = "thang", nullable = false)
    private Integer thang;

    @Column(name = "nam", nullable = false)
    private Integer nam;

    @Column(name = "chi_so_dien_dau", precision = 10, scale = 2)
    private BigDecimal chiSoDienDau = BigDecimal.ZERO;

    @Column(name = "chi_so_dien_cuoi", precision = 10, scale = 2)
    private BigDecimal chiSoDienCuoi = BigDecimal.ZERO;

    @Column(name = "chi_so_nuoc_dau", precision = 10, scale = 2)
    private BigDecimal chiSoNuocDau = BigDecimal.ZERO;

    @Column(name = "chi_so_nuoc_cuoi", precision = 10, scale = 2)
    private BigDecimal chiSoNuocCuoi = BigDecimal.ZERO;

    @Column(name = "phi_khac", precision = 12, scale = 0)
    private BigDecimal phiKhac = BigDecimal.ZERO;

    @Column(name = "ghi_chu_phi_khac", columnDefinition = "TEXT")
    private String ghiChuPhiKhac;

    @Column(name = "tong_tien", nullable = false, precision = 12, scale = 0)
    private BigDecimal tongTien = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThai trangThai = TrangThai.CHUA_TT;

    @Builder.Default
    @Column(name = "da_gui", nullable = false)
    private Boolean daGui = false;

    @Column(name = "ngay_thanh_toan")
    private LocalDateTime ngayThanhToan;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum TrangThai { CHUA_TT, DA_TT }
}
