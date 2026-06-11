package com.roomrental.service;

import com.roomrental.dto.request.ContractRequest;
import com.roomrental.dto.request.ContractRenewRequest;
import com.roomrental.dto.request.ContractTerminateRequest;
import com.roomrental.dto.response.ContractResponse;
import com.roomrental.entity.Contract;

import java.util.List;

public interface ContractService {
    List<ContractResponse> getAll(Contract.TrangThai trangThai);
    ContractResponse create(ContractRequest request);
    ContractResponse getById(Long id);
    ContractResponse terminate(Long id, ContractTerminateRequest request);
    ContractResponse renew(Long id, ContractRenewRequest request);
    List<ContractResponse> getExpiringSoon();
    ContractResponse getMyContract(String soDienThoai);
    ContractResponse uploadDocument(Long id, org.springframework.web.multipart.MultipartFile file);

    ContractResponse deleteDocument(Long id);
}
