package com.roomrental.controller;

import com.roomrental.dto.request.RepairRequestCreate;
import com.roomrental.dto.response.RepairRequestResponse;
import com.roomrental.entity.RepairRequest;
import com.roomrental.service.RepairRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class RepairRequestController {

    private final RepairRequestService repairRequestService;

    // TENANT: gửi yêu cầu
    @PostMapping("/api/repair-requests")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<RepairRequestResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody RepairRequestCreate request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(repairRequestService.create(userDetails.getUsername(), request));
    }

    // ADMIN: danh sách tất cả yêu cầu
    @GetMapping("/api/repair-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RepairRequestResponse>> getAll(
            @RequestParam(required = false) Long phongId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime tuNgay,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime denNgay) {
        return ResponseEntity.ok(repairRequestService.getAll(phongId, tuNgay, denNgay));
    }

    // ADMIN: cập nhật trạng thái
    @PatchMapping("/api/repair-requests/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RepairRequestResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam RepairRequest.TrangThai trangThai) {
        return ResponseEntity.ok(repairRequestService.updateStatus(id, trangThai));
    }

    // TENANT: xem yêu cầu của mình
    @GetMapping("/api/me/repair-requests")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<List<RepairRequestResponse>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(repairRequestService.getMyRequests(userDetails.getUsername()));
    }
}
