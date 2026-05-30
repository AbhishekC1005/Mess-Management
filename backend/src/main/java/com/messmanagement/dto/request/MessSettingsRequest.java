package com.messmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class MessSettingsRequest {
    
    @NotNull(message = "Lunch cutoff time is required")
    private LocalTime lunchCutoffTime;
    
    @NotNull(message = "Dinner cutoff time is required")
    private LocalTime dinnerCutoffTime;
    
    @NotNull(message = "Auto mark enabled flag is required")
    private Boolean autoMarkEnabled;
    
    @NotNull(message = "Timezone is required")
    private String timezone;
}
