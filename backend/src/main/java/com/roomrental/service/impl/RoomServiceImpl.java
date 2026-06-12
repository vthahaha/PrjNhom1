package com.roomrental.service.impl;

import com.roomrental.dto.request.RoomRequest;
import com.roomrental.dto.response.RoomResponse;
import com.roomrental.entity.Contract;
import com.roomrental.entity.Room;
import com.roomrental.exception.BadRequestException;
import com.roomrental.exception.ResourceNotFoundException;
import com.roomrental.repository.ContractRepository;
import com.roomrental.repository.RoomRepository;
import com.roomrental.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final ContractRepository contractRepository;

    @Override
    public List<RoomResponse> getAll(String search, Room.TrangThai trangThai, Boolean availableForContract) {
        List<Room> rooms = roomRepository.findByFilter(search, trangThai);
        if (Boolean.TRUE.equals(availableForContract)) {
            return rooms.stream()
                    .filter(r -> r.getTrangThai() != Room.TrangThai.DANG_SUA)
                    .map(this::toResponse)
                    .filter(res -> {
                        int maxOccupants = res.soNguoiToiDa() != null ? res.soNguoiToiDa() : 2;
                        return res.soNguoiDaO() < maxOccupants;
                    })
                    .toList();
        }
        return rooms.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public RoomResponse create(RoomRequest request) {
        Room room = Room.builder()
                .tenPhong(request.tenPhong())
                .dienTich(request.dienTich())
                .soNguoiToiDa(request.soNguoiToiDa())
                .tienNghi(request.tienNghi())
                .giaThue(request.giaThue())
                .build();
        return toResponse(roomRepository.save(room));
    }

    @Override
    public RoomResponse getById(Long id) {
        return toResponse(findRoom(id));
    }

    @Override
    @Transactional
    public RoomResponse update(Long id, RoomRequest request) {
        Room room = findRoom(id);
        room.setTenPhong(request.tenPhong());
        room.setDienTich(request.dienTich());
        room.setSoNguoiToiDa(request.soNguoiToiDa());
        room.setTienNghi(request.tienNghi());
        room.setGiaThue(request.giaThue());
        return toResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        findRoom(id);
        if (contractRepository.existsByRoomIdAndTrangThai(id, Contract.TrangThai.HIEU_LUC)) {
            throw new BadRequestException("Không thể xóa phòng đang có hợp đồng hiệu lực");
        }
        roomRepository.deleteById(id);
    }

    @Override
    @Transactional
    public RoomResponse updateStatus(Long id, Room.TrangThai trangThai) {
        Room room = findRoom(id);
        room.setTrangThai(trangThai);
        return toResponse(roomRepository.save(room));
    }

    private Room findRoom(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phòng không tồn tại: " + id));
    }

    private RoomResponse toResponse(Room room) {
        List<Contract> activeContracts = contractRepository.findByRoomIdAndTrangThai(room.getId(), Contract.TrangThai.HIEU_LUC);
        int currentOccupants = activeContracts.stream().mapToInt(Contract::getSoNguoiO).sum();
        return new RoomResponse(room.getId(), room.getTenPhong(), room.getDienTich(),
                room.getSoNguoiToiDa(), room.getTienNghi(), room.getGiaThue(),
                room.getTrangThai(), room.getCreatedAt(), currentOccupants);
    }
}
