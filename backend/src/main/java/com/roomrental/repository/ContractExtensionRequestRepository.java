package com.roomrental.repository;

import com.roomrental.entity.ContractExtensionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractExtensionRequestRepository extends JpaRepository<ContractExtensionRequest, Long> {
    List<ContractExtensionRequest> findByTenantIdOrderByCreatedAtDesc(Long tenantId);
    List<ContractExtensionRequest> findAllByOrderByCreatedAtDesc();
}
