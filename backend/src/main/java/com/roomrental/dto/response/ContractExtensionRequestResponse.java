package com.roomrental.dto.response;

import com.roomrental.entity.ContractExtensionRequest;
import java.time.LocalDateTime;

public record ContractExtensionRequestResponse(
    Long id,
    Long contractId,
    String tenPhong,
    Long tenantId,
    String hoTenTenant,
    Integer soThangGiaHan,
    String ghiChu,
    ContractExtensionRequest.TrangThai trangThai,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
