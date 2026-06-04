package com.roomrental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_dich_vu", nullable = false, unique = true, length = 100)
    private String tenDichVu;

    @Column(name = "don_gia_mac_dinh", nullable = false, precision = 12, scale = 0)
    private BigDecimal donGiaMacDinh;

    @Column(name = "don_vi", length = 50)
    private String donVi;  // VD: "tháng", "kWh", "m³"

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
