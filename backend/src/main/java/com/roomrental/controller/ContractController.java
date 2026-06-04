package com.roomrental.controller;

import com.roomrental.dto.request.ContractRenewRequest;
import com.roomrental.dto.request.ContractRequest;
import com.roomrental.dto.request.ContractTerminateRequest;
import com.roomrental.dto.response.ContractResponse;
import com.roomrental.entity.Contract;
import com.roomrental.service.ContractService;
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
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContractResponse>> getAll(
            @RequestParam(required = false) Contract.TrangThai trangThai) {
        return ResponseEntity.ok(contractService.getAll(trangThai));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContractResponse> create(@Valid @RequestBody ContractRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contractService.create(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContractResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.getById(id));
    }

    @PatchMapping("/{id}/terminate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContractResponse> terminate(
            @PathVariable Long id,
            @Valid @RequestBody ContractTerminateRequest request) {
        return ResponseEntity.ok(contractService.terminate(id, request));
    }

    @PatchMapping("/{id}/renew")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContractResponse> renew(
            @PathVariable Long id,
            @Valid @RequestBody ContractRenewRequest request) {
        return ResponseEntity.ok(contractService.renew(id, request));
    }

    @GetMapping("/expiring-soon")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContractResponse>> getExpiringSoon() {
        return ResponseEntity.ok(contractService.getExpiringSoon());
    }

    // TENANT: xem hợp đồng của mình
    @GetMapping("/me")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<ContractResponse> getMyContract(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(contractService.getMyContract(userDetails.getUsername()));
    }
}
