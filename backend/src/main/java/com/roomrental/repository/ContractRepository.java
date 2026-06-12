package com.roomrental.repository;

import com.roomrental.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {

    List<Contract> findByTrangThai(Contract.TrangThai trangThai);

    List<Contract> findByRoomIdAndTrangThai(Long roomId, Contract.TrangThai trangThai);

    boolean existsByRoomIdAndTrangThai(Long roomId, Contract.TrangThai trangThai);

    boolean existsByKhachThueIdAndTrangThai(Long userId, Contract.TrangThai trangThai);

    Optional<Contract> findTopByKhachThueIdAndTrangThaiOrderByNgayBatDauDesc(
            Long userId, Contract.TrangThai trangThai);

    @Query("SELECT c FROM Contract c WHERE c.trangThai = 'HIEU_LUC' " +
           "AND c.ngayKetThuc BETWEEN :from AND :to")
    List<Contract> findExpiringSoon(@Param("from") LocalDate from,
                                    @Param("to") LocalDate to);
}
