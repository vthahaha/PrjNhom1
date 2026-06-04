package com.roomrental.controller;

import com.roomrental.dto.response.RoomResponse;
import com.roomrental.entity.Room;
import com.roomrental.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final RoomRepository roomRepository;

    /**
     * GET /api/public/rooms – Danh sách phòng còn trống (không cần đăng nhập)
     */
    @GetMapping("/rooms")
    public ResponseEntity<List<RoomResponse>> getAvailableRooms() {
        List<RoomResponse> rooms = roomRepository.findByFilter(null, Room.TrangThai.TRONG)
                .stream()
                .map(r -> new RoomResponse(r.getId(), r.getTenPhong(), r.getDienTich(),
                        r.getSoNguoiToiDa(), r.getTienNghi(), r.getGiaThue(),
                        r.getTrangThai(), r.getCreatedAt()))
                .toList();
        return ResponseEntity.ok(rooms);
    }

    /**
     * GET /api/public/rooms/{id} – Chi tiết phòng công khai
     */
    @GetMapping("/rooms/{id}")
    public ResponseEntity<RoomResponse> getRoomDetail(@PathVariable Long id) {
        return roomRepository.findById(id)
                .map(r -> ResponseEntity.ok(new RoomResponse(r.getId(), r.getTenPhong(), r.getDienTich(),
                        r.getSoNguoiToiDa(), r.getTienNghi(), r.getGiaThue(),
                        r.getTrangThai(), r.getCreatedAt())))
                .orElse(ResponseEntity.notFound().build());
    }
}
