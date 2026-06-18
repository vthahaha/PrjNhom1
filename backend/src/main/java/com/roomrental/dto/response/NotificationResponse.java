package com.roomrental.dto.response;

import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    String noiDung,
    boolean daDoc,
    boolean forAdmin,
    LocalDateTime createdAt
) {}
