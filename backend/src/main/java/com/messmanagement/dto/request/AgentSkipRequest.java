package com.messmanagement.dto.request;

import com.messmanagement.entity.enums.MealPlan;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AgentSkipRequest {
    
    @NotNull(message = "Customer ID is required")
    private java.util.UUID customerId;
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    @NotNull(message = "Meal is required")
    private MealPlan meal;
}
