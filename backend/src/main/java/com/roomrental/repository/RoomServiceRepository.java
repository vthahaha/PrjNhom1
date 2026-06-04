package com.roomrental.repository;

import com.roomrental.entity.RoomService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomServiceRepository extends JpaRepository<RoomService, Long> {

    List<RoomService> findByRoomId(Long roomId);

    void deleteByRoomId(Long roomId);
}
