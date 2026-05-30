package com.messmanagement.service.impl;

import com.messmanagement.dto.request.DailyMenuRequest;
import com.messmanagement.dto.response.DailyMenuResponse;
import com.messmanagement.entity.DailyMenu;
import com.messmanagement.exception.ResourceNotFoundException;
import com.messmanagement.repository.DailyMenuRepository;
import com.messmanagement.repository.MessRepository;
import com.messmanagement.security.SecurityUtils;
import com.messmanagement.service.DailyMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DailyMenuServiceImpl implements DailyMenuService {

    private final DailyMenuRepository dailyMenuRepository;
    private final MessRepository messRepository;

    @Override
    @Transactional(readOnly = true)
    public DailyMenuResponse getMenuByDate(LocalDate date) {
        UUID messId = SecurityUtils.getCurrentMessId();
        DailyMenu menu = dailyMenuRepository.findByMessIdAndDate(messId, date)
                .orElseThrow(() -> new ResourceNotFoundException("Menu not found for date: " + date));
        return toResponse(menu);
    }

    @Override
    public DailyMenuResponse saveMenu(DailyMenuRequest request) {
        UUID messId = SecurityUtils.getCurrentMessId();
        Optional<DailyMenu> existing = dailyMenuRepository.findByMessIdAndDate(messId, request.getDate());
        DailyMenu menu;

        if (existing.isPresent()) {
            menu = existing.get();
            menu.setLunchMenu(request.getLunchMenu());
            menu.setDinnerMenu(request.getDinnerMenu());
        } else {
            menu = new DailyMenu();
            menu.setMess(messRepository.getReferenceById(messId));
            menu.setDate(request.getDate());
            menu.setLunchMenu(request.getLunchMenu());
            menu.setDinnerMenu(request.getDinnerMenu());
        }

        DailyMenu saved = dailyMenuRepository.save(menu);
        return toResponse(saved);
    }

    private DailyMenuResponse toResponse(DailyMenu menu) {
        DailyMenuResponse response = new DailyMenuResponse();
        response.setId(menu.getId());
        response.setDate(menu.getDate());
        response.setLunchMenu(menu.getLunchMenu());
        response.setDinnerMenu(menu.getDinnerMenu());
        response.setCreatedAt(menu.getCreatedAt());
        response.setUpdatedAt(menu.getUpdatedAt());
        return response;
    }
}
