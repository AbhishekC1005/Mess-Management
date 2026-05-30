package com.messmanagement.service;

import com.messmanagement.dto.request.AgentBulkSkipRequest;
import com.messmanagement.dto.request.AgentSkipRequest;
import com.messmanagement.dto.request.AgentFeedbackRequest;
import com.messmanagement.dto.request.AgentCorrectAttendanceRequest;
import com.messmanagement.dto.response.AgentCustomerResponse;
import com.messmanagement.dto.response.AttendanceLogResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AgentService {
    List<AgentCustomerResponse> findCustomerByPhone(String phone);
    List<AgentCustomerResponse> findCustomerByTelegramChatId(Long telegramChatId);
    AttendanceLogResponse skipMeal(AgentSkipRequest request);
    List<AttendanceLogResponse> bulkSkipMeals(AgentBulkSkipRequest request);
    AgentCustomerResponse pauseSubscription(java.util.UUID customerId);
    AgentCustomerResponse resumeSubscription(java.util.UUID customerId);
    AgentCustomerResponse updateTelegramChatId(java.util.UUID customerId, Long telegramChatId);
    AgentCustomerResponse getSubscriptionDetails(java.util.UUID customerId);
    java.util.Map<String, String> getTodayMenu(java.util.UUID messId);
    com.messmanagement.dto.response.MessSettingsResponse getSettings(java.util.UUID messId);
    List<AgentCustomerResponse> getAllCustomersWithTelegram();
    List<AgentCustomerResponse> getCustomersWithDuePayments();
    List<AgentCustomerResponse> getCustomersNearExpiry(int daysRemaining);
    Map<String, Object> recordFeedback(AgentFeedbackRequest request);
    Map<String, Object> adminBroadcast(String message);
    AttendanceLogResponse adminCorrectAttendance(AgentCorrectAttendanceRequest request);
}

