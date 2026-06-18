package com.roomrental.controller;

import com.roomrental.dto.response.NotificationResponse;
import com.roomrental.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getAdminNotifications() {
        return ResponseEntity.ok(notificationService.getAdminNotifications());
    }

    @GetMapping("/tenant")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<List<NotificationResponse>> getTenantNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getTenantNotifications(userDetails.getUsername()));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'TENANT')")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/read-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markAllAdminAsRead() {
        notificationService.markAllAdminAsRead();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/unread-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getUnreadAdminCount() {
        return ResponseEntity.ok(notificationService.getUnreadAdminCount());
    }

    @GetMapping("/tenant/unread-count")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<Long> getUnreadTenantCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getUnreadTenantCount(userDetails.getUsername()));
    }
}
