package com.messmanagement.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DailyMenuResponse {
    private UUID id;
    private LocalDate date;
    private String lunchMenu;
    private String dinnerMenu;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
