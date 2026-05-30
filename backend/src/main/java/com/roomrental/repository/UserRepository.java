package com.roomrental.repository;

import com.roomrental.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findBySoDienThoai(String soDienThoai);
    Optional<User> findByEmail(String email);
    boolean existsBySoDienThoai(String soDienThoai);
}
