package com.messmanagement.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DailyMenuRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String lunchMenu;

    private String dinnerMenu;
}
