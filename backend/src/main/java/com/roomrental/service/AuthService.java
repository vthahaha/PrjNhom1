package com.roomrental.service;

import com.roomrental.dto.request.ChangePasswordRequest;
import com.roomrental.dto.request.LoginRequest;
import com.roomrental.dto.request.RegisterRequest;
import com.roomrental.dto.response.AuthResponse;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void changePassword(String username, ChangePasswordRequest request);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
    void firstLoginChange(String username, String newPassword);
}
