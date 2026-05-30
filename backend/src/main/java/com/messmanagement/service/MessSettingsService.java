package com.messmanagement.service;

import com.messmanagement.dto.request.MessSettingsRequest;
import com.messmanagement.dto.response.MessSettingsResponse;

public interface MessSettingsService {
    MessSettingsResponse getSettings();
    MessSettingsResponse updateSettings(MessSettingsRequest request);
}
