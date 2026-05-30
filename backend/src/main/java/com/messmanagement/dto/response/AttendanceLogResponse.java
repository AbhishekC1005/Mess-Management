package com.messmanagement.dto.response;

import com.messmanagement.entity.enums.ActionType;
import com.messmanagement.entity.enums.MealPlan;
import com.messmanagement.entity.enums.SourceType;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class AttendanceLogResponse {
    private UUID id;
    private LocalDate date;
    private UUID customerId;
    private String customerName;
    private MealPlan meal;
    private ActionType action;
    private SourceType source;
    private LocalDateTime createdAt;
}
