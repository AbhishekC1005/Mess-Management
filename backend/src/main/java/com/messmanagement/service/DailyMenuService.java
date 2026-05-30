package com.messmanagement.service;

import com.messmanagement.dto.request.DailyMenuRequest;
import com.messmanagement.dto.response.DailyMenuResponse;

import java.time.LocalDate;

public interface DailyMenuService {
    DailyMenuResponse getMenuByDate(LocalDate date);
    DailyMenuResponse saveMenu(DailyMenuRequest request);
}
