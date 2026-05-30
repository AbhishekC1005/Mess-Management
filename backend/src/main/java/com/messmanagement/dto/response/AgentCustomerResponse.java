package com.messmanagement.dto.response;

import com.messmanagement.entity.enums.CustomerStatus;
import com.messmanagement.entity.enums.MealPlan;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class AgentCustomerResponse {
    private UUID id;
    private String name;
    private MealPlan plan;
    private CustomerStatus status;
    private Integer mealsUsed;
    private Integer totalMeals;
    private BigDecimal amountDue;
    private LocalDate joinDate;
    private Integer skippedCount;
    private String phone;
    private Long telegramChatId;
    private UUID messId;
    private String messName;
    private Integer daysRemaining;
}
