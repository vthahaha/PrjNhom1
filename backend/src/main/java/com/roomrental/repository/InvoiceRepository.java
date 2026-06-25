package com.roomrental.repository;

import com.roomrental.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("SELECT i FROM Invoice i " +
           "WHERE (:thang IS NULL OR i.thang = :thang) " +
           "AND (:nam IS NULL OR i.nam = :nam) " +
           "AND (:phongId IS NULL OR i.hopDong.room.id = :phongId) " +
           "AND (:trangThai IS NULL OR i.trangThai = :trangThai)")
    List<Invoice> findByFilter(@Param("thang") Integer thang,
                               @Param("nam") Integer nam,
                               @Param("phongId") Long phongId,
                               @Param("trangThai") Invoice.TrangThai trangThai);

    List<Invoice> findByHopDongKhachThueId(Long userId);

    java.util.Optional<Invoice> findTopByHopDongIdAndThangAndNam(Long hopDongId, Integer thang, Integer nam);

    long countByTrangThai(Invoice.TrangThai trangThai);

    @Query(value = "SELECT COALESCE(SUM(tong_tien), 0) FROM invoice WHERE trang_thai = 'CHUA_TT'", nativeQuery = true)
    BigDecimal sumUnpaidAmount();

    /** Doanh thu từng tháng trong năm (chỉ tính hóa đơn đã thanh toán) */
    @Query(value = "SELECT thang, SUM(tong_tien) FROM invoice " +
           "WHERE nam = :year AND trang_thai = 'DA_TT' " +
           "GROUP BY thang ORDER BY thang", nativeQuery = true)
    List<Object[]> revenueByMonth(@Param("year") int year);

    @Query(value = "SELECT COALESCE(SUM(tong_tien), 0) FROM invoice WHERE trang_thai = 'DA_TT' AND ngay_thanh_toan BETWEEN :start AND :end", nativeQuery = true)
    Number sumPaidAmountByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
