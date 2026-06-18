package com.roomrental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contract")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "ky_dong_tien", nullable = false)
    private Integer kyDongTien = 1;

    @Column(name = "ly_do_cham_dut", columnDefinition = "TEXT")
    private String lyDoChamDut;

    @Column(name = "ngay_tra_phong")
    private LocalDate ngayTraPhong;

    @Column(name = "file_hop_dong_url")
    private String fileHopDongUrl;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "contract_service",
        joinColumns = @JoinColumn(name = "hop_dong_id"),
        inverseJoinColumns = @JoinColumn(name = "dich_vu_id")
    )
    private List<Service> dichVu = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum TrangThai { HIEU_LUC, HET_HAN, CHAM_DUT }

    // Builder thủ công để tránh xung đột @Builder.Default với @ManyToMany
    public static ContractBuilder builder() {
        return new ContractBuilder();
    }

    public static class ContractBuilder {
        private Room room;
        private User khachThue;
        private LocalDate ngayBatDau;
        private LocalDate ngayKetThuc;
        private BigDecimal giaThue;
        private BigDecimal tienCoc = BigDecimal.ZERO;
        private TrangThai trangThai = TrangThai.HIEU_LUC;
        private Integer soNguoiO = 1;
        private Integer kyDongTien = 1;
        private String lyDoChamDut;
        private LocalDate ngayTraPhong;
        private String fileHopDongUrl;
        private List<Service> dichVu = new ArrayList<>();

        public ContractBuilder room(Room room) { this.room = room; return this; }
        public ContractBuilder khachThue(User khachThue) { this.khachThue = khachThue; return this; }
        public ContractBuilder ngayBatDau(LocalDate ngayBatDau) { this.ngayBatDau = ngayBatDau; return this; }
        public ContractBuilder ngayKetThuc(LocalDate ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; return this; }
        public ContractBuilder giaThue(BigDecimal giaThue) { this.giaThue = giaThue; return this; }
        public ContractBuilder tienCoc(BigDecimal tienCoc) { this.tienCoc = tienCoc; return this; }
        public ContractBuilder trangThai(TrangThai trangThai) { this.trangThai = trangThai; return this; }
        public ContractBuilder soNguoiO(Integer soNguoiO) { this.soNguoiO = soNguoiO; return this; }
        public ContractBuilder kyDongTien(Integer kyDongTien) { this.kyDongTien = kyDongTien; return this; }
        public ContractBuilder lyDoChamDut(String lyDoChamDut) { this.lyDoChamDut = lyDoChamDut; return this; }
        public ContractBuilder ngayTraPhong(LocalDate ngayTraPhong) { this.ngayTraPhong = ngayTraPhong; return this; }
        public ContractBuilder fileHopDongUrl(String fileHopDongUrl) { this.fileHopDongUrl = fileHopDongUrl; return this; }
        public ContractBuilder dichVu(List<Service> dichVu) { this.dichVu = dichVu; return this; }

        public Contract build() {
            Contract c = new Contract();
            c.room = room;
            c.khachThue = khachThue;
            c.ngayBatDau = ngayBatDau;
            c.ngayKetThuc = ngayKetThuc;
            c.giaThue = giaThue;
            c.tienCoc = tienCoc;
            c.trangThai = trangThai;
            c.soNguoiO = soNguoiO;
            c.kyDongTien = kyDongTien;
            c.lyDoChamDut = lyDoChamDut;
            c.ngayTraPhong = ngayTraPhong;
            c.fileHopDongUrl = fileHopDongUrl;
            c.dichVu = dichVu;
            return c;
        }
    }
}
