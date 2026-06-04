package com.roomrental.repository;

import com.roomrental.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<Service, Long> {

    boolean existsByTenDichVu(String tenDichVu);
}
