package com.roomrental.service;

import com.roomrental.dto.request.ContractExtensionRequestDto;
import com.roomrental.dto.response.ContractExtensionRequestResponse;

import java.util.List;

public interface ContractExtensionRequestService {
    ContractExtensionRequestResponse createRequest(String soDienThoai, ContractExtensionRequestDto requestDto);
    List<ContractExtensionRequestResponse> getTenantRequests(String soDienThoai);
    List<ContractExtensionRequestResponse> getAllRequests();
    ContractExtensionRequestResponse approveRequest(Long requestId);
    ContractExtensionRequestResponse rejectRequest(Long requestId);
}
