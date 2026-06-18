package com.roomrental.service;

import com.roomrental.dto.request.TenantRequest;
import com.roomrental.dto.request.UpdateMeRequest;
import com.roomrental.dto.response.ContractResponse;
import com.roomrental.dto.response.TenantResponse;

import java.util.List;

public interface TenantService {
    List<TenantResponse> getAll();
    TenantResponse create(TenantRequest request);
    TenantResponse getById(Long id);
    TenantResponse update(Long id, TenantRequest request);
    void delete(Long id);
    List<ContractResponse> getContractHistory(Long id);
    TenantResponse getMe(String soDienThoai);
    TenantResponse updateMe(String soDienThoai, UpdateMeRequest request);
    TenantResponse updateAvatar(String soDienThoai, org.springframework.web.multipart.MultipartFile file);
}
