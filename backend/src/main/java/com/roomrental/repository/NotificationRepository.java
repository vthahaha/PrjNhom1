package com.roomrental.repository;

import com.roomrental.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByForAdminOrderByCreatedAtDesc(boolean forAdmin);
    long countByForAdminAndDaDoc(boolean forAdmin, boolean daDoc);
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndDaDoc(Long userId, boolean daDoc);
}
