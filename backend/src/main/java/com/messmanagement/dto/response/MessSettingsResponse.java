package com.messmanagement.dto.response;

import lombok.Data;

import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MessSettingsResponse {
    private UUID id;
    private LocalTime lunchCutoffTime;
    private LocalTime dinnerCutoffTime;
    private Boolean autoMarkEnabled;
    private String timezone;
    private LocalDateTime updatedAt;
}
