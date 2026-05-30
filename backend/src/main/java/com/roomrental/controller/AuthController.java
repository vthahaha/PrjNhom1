package com.roomrental.controller;

import com.roomrental.dto.request.ChangePasswordRequest;
import com.roomrental.dto.request.LoginRequest;
import com.roomrental.dto.response.AuthResponse;
import com.roomrental.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Stateless JWT: client deletes token. Server-side blacklist có thể thêm sau.
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        authService.forgotPassword(email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestParam String token,
                                               @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/first-login-change")
    public ResponseEntity<Void> firstLoginChange(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String newPassword) {
        authService.firstLoginChange(userDetails.getUsername(), newPassword);
        return ResponseEntity.noContent().build();
    }
}
