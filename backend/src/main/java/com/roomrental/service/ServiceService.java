package com.roomrental.service;

import com.roomrental.dto.request.RoomServiceRequest;
import com.roomrental.dto.request.ServiceRequest;
import com.roomrental.dto.response.RoomServiceResponse;
import com.roomrental.dto.response.ServiceResponse;

import java.util.List;

public interface ServiceService {
    List<ServiceResponse> getAll();
    ServiceResponse create(ServiceRequest request);
    ServiceResponse update(Long id, ServiceRequest request);
    void delete(Long id);
    List<RoomServiceResponse> getRoomServices(Long roomId);
    List<RoomServiceResponse> updateRoomServices(Long roomId, RoomServiceRequest request);
}
