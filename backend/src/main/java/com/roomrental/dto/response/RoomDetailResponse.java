package com.roomrental.dto.response;

import java.util.List;

public record RoomDetailResponse(
    RoomResponse room,
    ContractResponse activeContract,
    List<InvoiceResponse> recentInvoices,
    List<RepairRequestResponse> recentRepairRequests
) {}
