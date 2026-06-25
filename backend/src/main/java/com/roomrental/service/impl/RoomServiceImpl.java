package com.roomrental.service.impl;

import com.roomrental.dto.request.RoomRequest;
import com.roomrental.dto.response.RoomResponse;
import com.roomrental.dto.response.RoomDetailResponse;
import com.roomrental.dto.response.ContractResponse;
import com.roomrental.dto.response.InvoiceResponse;
import com.roomrental.dto.response.RepairRequestResponse;
import com.roomrental.entity.Contract;
import com.roomrental.entity.Room;
import com.roomrental.exception.BadRequestException;
import com.roomrental.exception.ResourceNotFoundException;
import com.roomrental.repository.ContractRepository;
import com.roomrental.repository.RoomRepository;
import com.roomrental.service.RoomService;
import com.roomrental.service.InvoiceService;
import com.roomrental.service.RepairRequestService;
import com.roomrental.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final ContractRepository contractRepository;
    private final InvoiceService invoiceService;
    private final RepairRequestService repairRequestService;
    private final FileStorageService fileStorageService;

    @Override
    @Cacheable(value = "rooms", key = "{#search, #trangThai, #availableForContract}")
    public List<RoomResponse> getAll(String search, Room.TrangThai trangThai, Boolean availableForContract) {
        List<Room> rooms = roomRepository.findByFilter(search, trangThai);
        if (Boolean.TRUE.equals(availableForContract)) {
            return rooms.stream()
                    .filter(r -> r.getTrangThai() == Room.TrangThai.TRONG)
                    .map(this::toResponse)
                    .filter(res -> res.soNguoiDaO() == 0)
                    .toList();
        }
        return rooms.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    @CacheEvict(value = "rooms", allEntries = true)
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
    @Cacheable(value = "rooms", key = "#id")
    public RoomResponse getById(Long id) {
        return toResponse(findRoom(id));
    }

    @Override
    @Transactional
    @CacheEvict(value = "rooms", allEntries = true)
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
    @CacheEvict(value = "rooms", allEntries = true)
    public void delete(Long id) {
        findRoom(id);
        if (contractRepository.existsByRoomIdAndTrangThai(id, Contract.TrangThai.HIEU_LUC)) {
            throw new BadRequestException("Không thể xóa phòng đang có hợp đồng hiệu lực");
        }
        roomRepository.deleteById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "rooms", allEntries = true)
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

    @Override
    public RoomDetailResponse getRoomDetail(Long id) {
        Room room = findRoom(id);
        RoomResponse roomResponse = toResponse(room);
        
        List<Contract> activeContracts = contractRepository.findByRoomIdAndTrangThai(id, Contract.TrangThai.HIEU_LUC);
        Contract activeContract = activeContracts.isEmpty() ? null : activeContracts.get(0);
        ContractResponse activeContractResponse = activeContract != null ? toContractResponse(activeContract) : null;
        
        List<InvoiceResponse> recentInvoices = invoiceService.getAll(null, null, id, null);
        List<RepairRequestResponse> recentRepairRequests = repairRequestService.getAll(id, null, null);
        
        return new RoomDetailResponse(roomResponse, activeContractResponse, recentInvoices, recentRepairRequests);
    }

    private ContractResponse toContractResponse(Contract c) {
        List<ContractResponse.DichVuInfo> dichVuInfos = c.getDichVu() == null ? List.of() :
            c.getDichVu().stream()
                .map(s -> new ContractResponse.DichVuInfo(s.getId(), s.getTenDichVu(), s.getDonGiaMacDinh(), s.getDonVi()))
                .toList();
        return new ContractResponse(
                c.getId(),
                c.getRoom().getId(), c.getRoom().getTenPhong(),
                c.getKhachThue().getId(), c.getKhachThue().getHoTen(), c.getKhachThue().getSoDienThoai(),
                c.getNgayBatDau(), c.getNgayKetThuc(),
                c.getGiaThue(), c.getTienCoc(),
                c.getTrangThai(), c.getSoNguoiO(), c.getLyDoChamDut(), c.getNgayTraPhong(),
                c.getCreatedAt(), c.getRoom().getTienNghi(),
                fileStorageService.getPresignedUrl(c.getFileHopDongUrl()),
                c.getKyDongTien(),
                dichVuInfos);
    }
}
