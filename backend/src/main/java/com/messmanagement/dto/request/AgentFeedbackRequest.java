package com.messmanagement.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AgentFeedbackRequest {
    @NotNull
    private UUID customerId;

    @NotBlank
    private String meal;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;
}
