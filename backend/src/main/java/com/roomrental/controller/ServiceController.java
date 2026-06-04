package com.roomrental.controller;

import com.roomrental.dto.request.RoomServiceRequest;
import com.roomrental.dto.request.ServiceRequest;
import com.roomrental.dto.response.RoomServiceResponse;
import com.roomrental.dto.response.ServiceResponse;
import com.roomrental.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    // -------- /api/services --------

    @GetMapping("/api/services")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceResponse>> getAll() {
        return ResponseEntity.ok(serviceService.getAll());
    }

    @PostMapping("/api/services")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceResponse> create(@Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceService.create(request));
    }

    @PutMapping("/api/services/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(serviceService.update(id, request));
    }

    @DeleteMapping("/api/services/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        serviceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // -------- /api/rooms/{id}/services --------

    @GetMapping("/api/rooms/{id}/services")
    @PreAuthorize("hasAnyRole('ADMIN','TENANT')")
    public ResponseEntity<List<RoomServiceResponse>> getRoomServices(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getRoomServices(id));
    }

    @PutMapping("/api/rooms/{id}/services")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RoomServiceResponse>> updateRoomServices(
            @PathVariable Long id,
            @Valid @RequestBody RoomServiceRequest request) {
        return ResponseEntity.ok(serviceService.updateRoomServices(id, request));
    }
}
