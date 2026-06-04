package com.roomrental.repository;

import com.roomrental.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
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

    long countByTrangThai(Invoice.TrangThai trangThai);

    @Query("SELECT COALESCE(SUM(i.tongTien), 0) FROM Invoice i WHERE i.trangThai = 'CHUA_TT'")
    BigDecimal sumUnpaidAmount();

    /** Doanh thu từng tháng trong năm (chỉ tính hóa đơn đã thanh toán) */
    @Query("SELECT i.thang, SUM(i.tongTien) FROM Invoice i " +
           "WHERE i.nam = :year AND i.trangThai = 'DA_TT' " +
           "GROUP BY i.thang ORDER BY i.thang")
    List<Object[]> revenueByMonth(@Param("year") int year);
}
