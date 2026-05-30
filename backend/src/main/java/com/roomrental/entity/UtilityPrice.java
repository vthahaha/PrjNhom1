package com.roomrental.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "utility_price")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UtilityPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "don_gia_dien", nullable = false, precision = 10, scale = 0)
    private BigDecimal donGiaDien;

    @Column(name = "don_gia_nuoc", nullable = false, precision = 10, scale = 0)
    private BigDecimal donGiaNuoc;

    @Column(name = "ap_dung_tu", nullable = false)
    private LocalDate apDungTu;

    @Column(name = "ghi_chu", length = 200)
    private String ghiChu;
}
