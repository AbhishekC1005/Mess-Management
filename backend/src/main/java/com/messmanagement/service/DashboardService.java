package com.messmanagement.service;

import com.messmanagement.dto.response.AttendanceLogResponse;
import com.messmanagement.dto.response.DashboardStatsResponse;

import java.util.List;

public interface DashboardService {
    DashboardStatsResponse getDashboardStats();
    List<AttendanceLogResponse> getRecentActivity(int limit);
}
