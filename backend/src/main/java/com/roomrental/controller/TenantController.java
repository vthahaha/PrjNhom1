package com.roomrental.controller;

import com.roomrental.dto.request.TenantRequest;
import com.roomrental.dto.request.UpdateMeRequest;
import com.roomrental.dto.response.ContractResponse;
import com.roomrental.dto.response.TenantResponse;
import com.roomrental.service.TenantService;
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
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    // -------- ADMIN: /api/tenants --------

    @GetMapping("/api/tenants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TenantResponse>> getAll() {
        return ResponseEntity.ok(tenantService.getAll());
    }

    @PostMapping("/api/tenants")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TenantResponse> create(@Valid @RequestBody TenantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tenantService.create(request));
    }

    @GetMapping("/api/tenants/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TenantResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.getById(id));
    }

    @PutMapping("/api/tenants/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TenantResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody TenantRequest request) {
        return ResponseEntity.ok(tenantService.update(id, request));
    }

    @DeleteMapping("/api/tenants/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tenantService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/tenants/{id}/contracts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ContractResponse>> getContractHistory(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.getContractHistory(id));
    }

    // -------- TENANT: /api/me --------

    @GetMapping("/api/me")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<TenantResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tenantService.getMe(userDetails.getUsername()));
    }

    @PutMapping("/api/me")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<TenantResponse> updateMe(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateMeRequest request) {
        return ResponseEntity.ok(tenantService.updateMe(userDetails.getUsername(), request));
    }
}
