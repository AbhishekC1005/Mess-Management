package com.messmanagement.controller;

import com.messmanagement.dto.request.AgentBulkSkipRequest;
import com.messmanagement.dto.request.AgentSkipRequest;
import com.messmanagement.dto.request.AgentFeedbackRequest;
import com.messmanagement.dto.request.AgentCorrectAttendanceRequest;
import com.messmanagement.dto.request.AgentBroadcastRequest;
import com.messmanagement.dto.response.AgentCustomerResponse;
import com.messmanagement.dto.response.AttendanceLogResponse;
import com.messmanagement.service.AgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/agent")
@RequiredArgsConstructor
@Tag(name = "Agent", description = "Agent API endpoints for Telegram bot integration")
public class AgentController {
    
    private final AgentService agentService;
    
    @GetMapping("/customer/by-phone")
    @Operation(summary = "Find customer by phone number")
    public ResponseEntity<List<AgentCustomerResponse>> findCustomerByPhone(@RequestParam String phone) {
        return ResponseEntity.ok(agentService.findCustomerByPhone(phone));
    }
    
    @GetMapping("/customer/by-telegram-chat-id")
    @Operation(summary = "Find customer by Telegram Chat ID")
    public ResponseEntity<List<AgentCustomerResponse>> findCustomerByTelegramChatId(@RequestParam Long telegramChatId) {
        return ResponseEntity.ok(agentService.findCustomerByTelegramChatId(telegramChatId));
    }
    
    @PostMapping("/attendance/skip")
    @Operation(summary = "Mark meal as skipped via bot")
    public ResponseEntity<AttendanceLogResponse> skipMeal(@Valid @RequestBody AgentSkipRequest request) {
        return ResponseEntity.ok(agentService.skipMeal(request));
    }
    
    @PostMapping("/attendance/bulk-skip")
    @Operation(summary = "Bulk skip meals for a date range via bot")
    public ResponseEntity<List<AttendanceLogResponse>> bulkSkipMeals(@Valid @RequestBody AgentBulkSkipRequest request) {
        return ResponseEntity.ok(agentService.bulkSkipMeals(request));
    }
    
    @PostMapping("/customer/{id}/pause")
    @Operation(summary = "Pause customer subscription via bot")
    public ResponseEntity<AgentCustomerResponse> pauseSubscription(@PathVariable UUID id) {
        return ResponseEntity.ok(agentService.pauseSubscription(id));
    }
    
    @PostMapping("/customer/{id}/resume")
    @Operation(summary = "Resume customer subscription via bot")
    public ResponseEntity<AgentCustomerResponse> resumeSubscription(@PathVariable UUID id) {
        return ResponseEntity.ok(agentService.resumeSubscription(id));
    }
    
    @PatchMapping("/customer/{id}/telegram-chat-id")
    @Operation(summary = "Update customer telegram chat ID")
    public ResponseEntity<AgentCustomerResponse> updateTelegramChatId(
            @PathVariable UUID id, @RequestParam Long telegramChatId) {
        return ResponseEntity.ok(agentService.updateTelegramChatId(id, telegramChatId));
    }
    
    @GetMapping("/customer/{id}/subscription")
    @Operation(summary = "Get customer subscription details")
    public ResponseEntity<AgentCustomerResponse> getSubscriptionDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(agentService.getSubscriptionDetails(id));
    }

    @GetMapping("/menu/today")
    @Operation(summary = "Get today's menu for the bot")
    public ResponseEntity<java.util.Map<String, String>> getTodayMenu(@RequestParam UUID messId) {
        return ResponseEntity.ok(agentService.getTodayMenu(messId));
    }

    @GetMapping("/settings")
    @Operation(summary = "Get mess settings for the bot")
    public ResponseEntity<com.messmanagement.dto.response.MessSettingsResponse> getSettings(@RequestParam UUID messId) {
        return ResponseEntity.ok(agentService.getSettings(messId));
    }

    @GetMapping("/customers")
    @Operation(summary = "Get all customers with linked Telegram accounts")
    public ResponseEntity<List<AgentCustomerResponse>> getAllCustomersWithTelegram() {
        return ResponseEntity.ok(agentService.getAllCustomersWithTelegram());
    }

    @GetMapping("/customers/due-payments")
    @Operation(summary = "Get all active customers with due payments and Telegram links")
    public ResponseEntity<List<AgentCustomerResponse>> getCustomersWithDuePayments() {
        return ResponseEntity.ok(agentService.getCustomersWithDuePayments());
    }

    @GetMapping("/customers/near-expiry")
    @Operation(summary = "Get customers whose subscriptions expire soon")
    public ResponseEntity<List<AgentCustomerResponse>> getCustomersNearExpiry(
            @RequestParam(name = "days", defaultValue = "3") int days) {
        return ResponseEntity.ok(agentService.getCustomersNearExpiry(days));
    }

    @PostMapping("/feedback")
    @Operation(summary = "Record star rating and feedback for a meal")
    public ResponseEntity<java.util.Map<String, Object>> recordFeedback(
            @Valid @RequestBody AgentFeedbackRequest request) {
        return ResponseEntity.ok(agentService.recordFeedback(request));
    }

    @PostMapping("/admin/broadcast")
    @Operation(summary = "Get active user statistics for broadcast")
    public ResponseEntity<java.util.Map<String, Object>> adminBroadcast(
            @Valid @RequestBody AgentBroadcastRequest request) {
        return ResponseEntity.ok(agentService.adminBroadcast(request.getMessage()));
    }

    @PostMapping("/admin/correct-attendance")
    @Operation(summary = "Force correct attendance by admin")
    public ResponseEntity<AttendanceLogResponse> adminCorrectAttendance(
            @Valid @RequestBody AgentCorrectAttendanceRequest request) {
        return ResponseEntity.ok(agentService.adminCorrectAttendance(request));
    }
}
