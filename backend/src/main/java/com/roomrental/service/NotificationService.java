package com.roomrental.service;

import com.roomrental.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getAdminNotifications();
    List<NotificationResponse> getTenantNotifications(String soDienThoai);
    void markAsRead(Long id);
    void markAllAdminAsRead();
    long getUnreadAdminCount();
    long getUnreadTenantCount(String soDienThoai);
    void createAndSend(String content, com.roomrental.entity.User user, boolean forAdmin);
}
