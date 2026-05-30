package com.messmanagement.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalCustomers;
    private long mealsToday;
    private long skippedToday;
    private long pausedCustomers;
}
