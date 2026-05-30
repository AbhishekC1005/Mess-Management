package com.messmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class AgentCorrectAttendanceRequest {
    @NotNull
    private UUID customerId;

    @NotNull
    private LocalDate date;

    @NotBlank
    private String meal;

    @NotBlank
    private String action;
}
