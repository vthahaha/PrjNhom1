package com.roomrental.service;

import com.roomrental.dto.request.RoomRequest;
import com.roomrental.dto.response.RoomResponse;
import com.roomrental.entity.Room;

import java.util.List;

public interface RoomService {
    List<RoomResponse> getAll(String search, Room.TrangThai trangThai);
    RoomResponse create(RoomRequest request);
    RoomResponse getById(Long id);
    RoomResponse update(Long id, RoomRequest request);
    void delete(Long id);
    RoomResponse updateStatus(Long id, Room.TrangThai trangThai);
}
