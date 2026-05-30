package com.messmanagement.dto.request;

import com.messmanagement.entity.enums.CustomerStatus;
import com.messmanagement.entity.enums.MealPlan;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CustomerRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotNull(message = "Meal plan is required")
    private MealPlan plan;
    
    @NotNull(message = "Status is required")
    private CustomerStatus status;
    
    @Positive(message = "Total meals must be positive")
    private Integer totalMeals;
    
    private BigDecimal amountDue;
    
    private String phone;
    
    @NotNull(message = "Join date is required")
    private LocalDate joinDate;
}
