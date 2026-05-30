package com.messmanagement.service.impl;

import com.messmanagement.dto.request.MessSettingsRequest;
import com.messmanagement.dto.response.MessSettingsResponse;
import com.messmanagement.entity.MessSettings;
import com.messmanagement.exception.ResourceNotFoundException;
import com.messmanagement.repository.MessSettingsRepository;
import com.messmanagement.security.SecurityUtils;
import com.messmanagement.service.MessSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class MessSettingsServiceImpl implements MessSettingsService {
    
    private final MessSettingsRepository messSettingsRepository;
    
    @Override
    @Transactional(readOnly = true)
    public MessSettingsResponse getSettings() {
        MessSettings settings = getSettingsEntity();
        return toResponse(settings);
    }
    
    @Override
    public MessSettingsResponse updateSettings(MessSettingsRequest request) {
        MessSettings settings = getSettingsEntity();
        
        settings.setLunchCutoffTime(request.getLunchCutoffTime());
        settings.setDinnerCutoffTime(request.getDinnerCutoffTime());
        settings.setAutoMarkEnabled(request.getAutoMarkEnabled());
        settings.setTimezone(request.getTimezone());
        
        MessSettings updated = messSettingsRepository.save(settings);
        return toResponse(updated);
    }
    
    public MessSettings getSettingsEntity() {
        UUID messId = SecurityUtils.getCurrentMessId();
        return messSettingsRepository.findByMessId(messId)
                .orElseThrow(() -> new ResourceNotFoundException("Mess settings not found for mess: " + messId));
    }
    
    private MessSettingsResponse toResponse(MessSettings settings) {
        MessSettingsResponse response = new MessSettingsResponse();
        response.setId(settings.getId());
        response.setLunchCutoffTime(settings.getLunchCutoffTime());
        response.setDinnerCutoffTime(settings.getDinnerCutoffTime());
        response.setAutoMarkEnabled(settings.getAutoMarkEnabled());
        response.setTimezone(settings.getTimezone());
        response.setUpdatedAt(settings.getUpdatedAt());
        return response;
    }
}
