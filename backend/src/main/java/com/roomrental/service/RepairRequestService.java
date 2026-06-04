package com.roomrental.service;

import com.roomrental.dto.request.RepairRequestCreate;
import com.roomrental.dto.response.RepairRequestResponse;
import com.roomrental.entity.RepairRequest;

import java.time.LocalDateTime;
import java.util.List;

public interface RepairRequestService {
    RepairRequestResponse create(String soDienThoai, RepairRequestCreate request);
    List<RepairRequestResponse> getAll(Long phongId, LocalDateTime tuNgay, LocalDateTime denNgay);
    RepairRequestResponse updateStatus(Long id, RepairRequest.TrangThai trangThai);
    List<RepairRequestResponse> getMyRequests(String soDienThoai);
}
