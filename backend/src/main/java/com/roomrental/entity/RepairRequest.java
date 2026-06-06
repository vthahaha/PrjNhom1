package com.roomrental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "repair_request")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RepairRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hop_dong_id", nullable = false)
    private Contract hopDong;

    @Column(name = "mo_ta", nullable = false, columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "anh_url", columnDefinition = "TEXT")
    private String anhUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThai trangThai = TrangThai.CHO_XU_LY;

    @CreationTimestamp
    @Column(name = "ngay_gui", nullable = false, updatable = false)
    private LocalDateTime ngayGui;

    @UpdateTimestamp
    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @Column(name = "chi_phi", precision = 12, scale = 0)
    private BigDecimal chiPhi = BigDecimal.ZERO;

    public enum TrangThai { CHO_XU_LY, DANG_XU_LY, HOAN_THANH }
}
