package com.roomrental.controller;

import com.roomrental.dto.request.ContractExtensionRequestDto;
import com.roomrental.dto.response.ContractExtensionRequestResponse;
import com.roomrental.service.ContractExtensionRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts/extensions")
@RequiredArgsConstructor
public class ContractExtensionRequestController {

    private final ContractExtensionRequestService extensionService;

    @PostMapping
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<ContractExtensionRequestResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ContractExtensionRequestDto requestDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(extensionService.createRequest(userDetails.getUsername(), requestDto));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<List<ContractExtensionRequestResponse>> getMy(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(extensionService.getTenantRequests(userDetails.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContractExtensionRequestResponse>> getAll() {
        return ResponseEntity.ok(extensionService.getAllRequests());
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContractExtensionRequestResponse> approve(@PathVariable Long id) {
        return ResponseEntity.ok(extensionService.approveRequest(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContractExtensionRequestResponse> reject(@PathVariable Long id) {
        return ResponseEntity.ok(extensionService.rejectRequest(id));
    }
}
