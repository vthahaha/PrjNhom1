package com.roomrental.repository;

import com.roomrental.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("SELECT r FROM Room r WHERE " +
           "(:search IS NULL OR LOWER(r.tenPhong) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:trangThai IS NULL OR r.trangThai = :trangThai)")
    List<Room> findByFilter(@Param("search") String search,
                            @Param("trangThai") Room.TrangThai trangThai);

    long countByTrangThai(Room.TrangThai trangThai);
}
