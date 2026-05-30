package com.messmanagement.dto.request;

import com.messmanagement.entity.enums.ActionType;
import com.messmanagement.entity.enums.MealPlan;
import com.messmanagement.entity.enums.SourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class AttendanceLogRequest {
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotNull(message = "Customer ID is required")
    private UUID customerId;
    
    @NotNull(message = "Meal is required")
    private MealPlan meal;
    
    @NotNull(message = "Action is required")
    private ActionType action;
    
    @NotNull(message = "Source is required")
    private SourceType source;
}
