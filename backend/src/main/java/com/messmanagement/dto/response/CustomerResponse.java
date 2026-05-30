package com.messmanagement.dto.response;

import com.messmanagement.entity.enums.CustomerStatus;
import com.messmanagement.entity.enums.MealPlan;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CustomerResponse {
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
    private List<PauseHistoryResponse> pauseHistory;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
