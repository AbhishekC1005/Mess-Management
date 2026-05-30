package com.messmanagement.dto.request;

import com.messmanagement.entity.enums.MealPlan;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AgentBulkSkipRequest {
    
    @NotNull(message = "Customer ID is required")
    private java.util.UUID customerId;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    @NotNull(message = "Meal is required")
    private MealPlan meal;
}
