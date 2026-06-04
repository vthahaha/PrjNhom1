package com.roomrental.repository;

import com.roomrental.entity.UtilityPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilityPriceRepository extends JpaRepository<UtilityPrice, Long> {

    Optional<UtilityPrice> findTopByOrderByApDungTuDesc();
}
