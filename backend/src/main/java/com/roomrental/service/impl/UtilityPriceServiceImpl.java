package com.roomrental.service.impl;

import com.roomrental.dto.request.UtilityPriceRequest;
import com.roomrental.dto.response.UtilityPriceResponse;
import com.roomrental.entity.UtilityPrice;
import com.roomrental.repository.UtilityPriceRepository;
import com.roomrental.service.UtilityPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UtilityPriceServiceImpl implements UtilityPriceService {

    private final UtilityPriceRepository utilityPriceRepository;

    @Override
    public List<UtilityPriceResponse> getAll() {
        return utilityPriceRepository.findAll().stream()
                .sorted((a, b) -> b.getApDungTu().compareTo(a.getApDungTu()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UtilityPriceResponse create(UtilityPriceRequest request) {
        UtilityPrice price = UtilityPrice.builder()
                .donGiaDien(request.donGiaDien())
                .donGiaNuoc(request.donGiaNuoc())
                .apDungTu(request.apDungTu())
                .ghiChu(request.ghiChu())
                .build();
        return toResponse(utilityPriceRepository.save(price));
    }

    private UtilityPriceResponse toResponse(UtilityPrice p) {
        return new UtilityPriceResponse(p.getId(), p.getDonGiaDien(),
                p.getDonGiaNuoc(), p.getApDungTu(), p.getGhiChu());
    }
}
