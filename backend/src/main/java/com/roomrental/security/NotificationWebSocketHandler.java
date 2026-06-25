package com.roomrental.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final JwtUtils jwtUtils;
    private final com.roomrental.repository.UserRepository userRepository;

    private static final Map<String, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    private static final Set<WebSocketSession> adminSessions = new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String query = session.getUri().getQuery();
        String token = null;
        if (query != null && query.contains("token=")) {
            token = query.substring(query.indexOf("token=") + 6);
            if (token.contains("&")) {
                token = token.substring(0, token.indexOf("&"));
            }
        }

        if (token != null && jwtUtils.validateToken(token)) {
            String username = jwtUtils.getUsernameFromToken(token);
            session.getAttributes().put("username", username);

            userRepository.findBySoDienThoai(username).ifPresent(user -> {
                if (user.getVaiTro() == com.roomrental.entity.User.VaiTro.ADMIN) {
                    adminSessions.add(session);
                    session.getAttributes().put("isAdmin", true);
                    log.info("Admin connected to WebSocket: {}", username);
                } else {
                    userSessions.computeIfAbsent(username, k -> new CopyOnWriteArraySet<>()).add(session);
                    session.getAttributes().put("isAdmin", false);
                    log.info("Tenant connected to WebSocket: {}", username);
                }
            });
        } else {
            session.close(CloseStatus.BAD_DATA);
            log.warn("WebSocket connection rejected: invalid token");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String username = (String) session.getAttributes().get("username");
        Boolean isAdmin = (Boolean) session.getAttributes().get("isAdmin");
        if (username != null) {
            if (Boolean.TRUE.equals(isAdmin)) {
                adminSessions.remove(session);
                log.info("Admin disconnected from WebSocket: {}", username);
            } else {
                Set<WebSocketSession> sessions = userSessions.get(username);
                if (sessions != null) {
                    sessions.remove(session);
                    if (sessions.isEmpty()) {
                        userSessions.remove(username);
                    }
                }
                log.info("Tenant disconnected from WebSocket: {}", username);
            }
        }
    }

    public void sendNotification(com.roomrental.entity.Notification notification) {
        String payload = String.format(
            "{\"id\":%d,\"noiDung\":\"%s\",\"daDoc\":%b,\"forAdmin\":%b,\"createdAt\":\"%s\"}",
            notification.getId(),
            notification.getNoiDung().replace("\"", "\\\"").replace("\n", "\\n"),
            notification.isDaDoc(),
            notification.isForAdmin(),
            notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : java.time.LocalDateTime.now().toString()
        );
        TextMessage message = new TextMessage(payload);

        if (notification.isForAdmin()) {
            for (WebSocketSession session : adminSessions) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(message);
                    } catch (IOException e) {
                        log.error("Error sending WebSocket message to admin", e);
                    }
                }
            }
        } else if (notification.getUser() != null) {
            String recipientPhone = notification.getUser().getSoDienThoai();
            Set<WebSocketSession> sessions = userSessions.get(recipientPhone);
            if (sessions != null) {
                for (WebSocketSession session : sessions) {
                    if (session.isOpen()) {
                        try {
                            session.sendMessage(message);
                        } catch (IOException e) {
                            log.error("Error sending WebSocket message to tenant {}", recipientPhone, e);
                        }
                    }
                }
            }
        }
    }
}
