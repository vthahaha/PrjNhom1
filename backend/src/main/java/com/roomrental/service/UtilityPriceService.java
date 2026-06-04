package com.roomrental.service;

import com.roomrental.dto.request.UtilityPriceRequest;
import com.roomrental.dto.response.UtilityPriceResponse;

import java.util.List;

public interface UtilityPriceService {
    List<UtilityPriceResponse> getAll();
    UtilityPriceResponse create(UtilityPriceRequest request);
}
