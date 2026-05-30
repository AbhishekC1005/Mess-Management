package com.messmanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AgentBroadcastRequest {
    @NotBlank
    private String message;
}
