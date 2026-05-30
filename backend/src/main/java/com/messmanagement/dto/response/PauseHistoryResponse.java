package com.messmanagement.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PauseHistoryResponse {
    private UUID id;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime createdAt;
}
