package com.messmanagement.controller;

import com.messmanagement.dto.request.MessSettingsRequest;
import com.messmanagement.dto.response.MessSettingsResponse;
import com.messmanagement.service.MessSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "Mess settings APIs")
public class MessSettingsController {
    
    private final MessSettingsService messSettingsService;
    
    @GetMapping
    @Operation(summary = "Get mess settings")
    public ResponseEntity<MessSettingsResponse> getSettings() {
        return ResponseEntity.ok(messSettingsService.getSettings());
    }
    
    @PutMapping
    @Operation(summary = "Update mess settings")
    public ResponseEntity<MessSettingsResponse> updateSettings(@Valid @RequestBody MessSettingsRequest request) {
        return ResponseEntity.ok(messSettingsService.updateSettings(request));
    }
}
