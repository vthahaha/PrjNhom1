package com.roomrental.repository;

import com.roomrental.entity.RepairRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface RepairRequestRepository extends JpaRepository<RepairRequest, Long> {

    List<RepairRequest> findByHopDongKhachThueId(Long userId);

    @Query("SELECT r FROM RepairRequest r " +
           "WHERE (:phongId IS NULL OR r.hopDong.room.id = :phongId) " +
           "AND (:tuNgay IS NULL OR r.ngayGui >= :tuNgay) " +
           "AND (:denNgay IS NULL OR r.ngayGui <= :denNgay)")
    List<RepairRequest> findByFilter(@Param("phongId") Long phongId,
                                     @Param("tuNgay") LocalDateTime tuNgay,
                                     @Param("denNgay") LocalDateTime denNgay);
}
