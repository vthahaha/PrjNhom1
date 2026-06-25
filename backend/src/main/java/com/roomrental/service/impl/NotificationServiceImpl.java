package com.roomrental.service.impl;

import com.roomrental.dto.response.NotificationResponse;
import com.roomrental.entity.Notification;
import com.roomrental.entity.User;
import com.roomrental.exception.ResourceNotFoundException;
import com.roomrental.repository.NotificationRepository;
import com.roomrental.repository.UserRepository;
import com.roomrental.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final com.roomrental.security.NotificationWebSocketHandler webSocketHandler;

    @Override
    public List<NotificationResponse> getAdminNotifications() {
        return notificationRepository.findByForAdminOrderByCreatedAtDesc(true)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<NotificationResponse> getTenantNotifications(String soDienThoai) {
        User user = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thông báo không tồn tại"));
        n.setDaDoc(true);
        notificationRepository.save(n);
    }

    @Override
    @Transactional
    public void markAllAdminAsRead() {
        List<Notification> unread = notificationRepository.findByForAdminOrderByCreatedAtDesc(true)
                .stream().filter(n -> !n.isDaDoc()).toList();
        for (Notification n : unread) {
            n.setDaDoc(true);
            notificationRepository.save(n);
        }
    }

    @Override
    public long getUnreadAdminCount() {
        return notificationRepository.countByForAdminAndDaDoc(true, false);
    }

    @Override
    public long getUnreadTenantCount(String soDienThoai) {
        User user = userRepository.findBySoDienThoai(soDienThoai)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        return notificationRepository.countByUserIdAndDaDoc(user.getId(), false);
    }

    @Override
    @Transactional
    public void createAndSend(String content, User user, boolean forAdmin) {
        Notification n = Notification.builder()
                .noiDung(content)
                .user(user)
                .forAdmin(forAdmin)
                .daDoc(false)
                .build();
        Notification saved = notificationRepository.save(n);
        
        try {
            webSocketHandler.sendNotification(saved);
        } catch (Exception e) {
            log.error("Lỗi khi gửi thông báo WebSocket: {}", e.getMessage());
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getNoiDung(),
                n.isDaDoc(),
                n.isForAdmin(),
                n.getCreatedAt()
        );
    }
}
