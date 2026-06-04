package com.roomrental.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;

/**
 * Xử lý lỗi 401 Unauthorized khi request không có JWT hoặc JWT không hợp lệ.
 * Trả về JSON thay vì redirect về trang login (vì đây là REST API stateless).
 */
@Component
@Slf4j
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        log.warn("Unauthorized request to [{}]: {}", request.getRequestURI(), authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        String body = String.format(
                "{\"status\":401,\"message\":\"Chưa xác thực. Vui lòng đăng nhập để tiếp tục.\",\"path\":\"%s\",\"timestamp\":\"%s\"}",
                request.getRequestURI(),
                LocalDateTime.now()
        );

        PrintWriter writer = response.getWriter();
        writer.print(body);
        writer.flush();
    }
}

