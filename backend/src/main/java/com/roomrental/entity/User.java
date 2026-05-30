package com.roomrental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ho_ten", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "so_dien_thoai", nullable = false, unique = true, length = 15)
    private String soDienThoai;

    @Column(name = "email", unique = true, length = 100)
    private String email;

    @Column(name = "mat_khau", nullable = false)
    private String matKhau;

    @Enumerated(EnumType.STRING)
    @Column(name = "vai_tro", nullable = false)
    private VaiTro vaiTro = VaiTro.TENANT;

    @Column(name = "doi_mk_lan_dau", nullable = false)
    private boolean doiMkLanDau = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum VaiTro { ADMIN, TENANT }
}
