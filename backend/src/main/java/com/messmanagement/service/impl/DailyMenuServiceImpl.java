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

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import java.util.concurrent.CompletableFuture;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DailyMenuServiceImpl implements DailyMenuService {

    private final DailyMenuRepository dailyMenuRepository;
    private final MessRepository messRepository;

    @Value("${agent.url:http://localhost:8000}")
    private String agentUrl;

    private final RestTemplate restTemplate = new RestTemplate();

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
        
        // Resolve Mess Name safely within the transactional context to prevent LazyInitializationException
        String messName = "Mess";
        if (saved.getMess() != null) {
            try {
                messName = saved.getMess().getName();
            } catch (Exception e) {
                // Fail-safe to prevent transaction failure on name load
            }
        }
        
        final String finalMessName = messName;
        
        // Asynchronously broadcast menu updates to the AI Agent
        CompletableFuture.runAsync(() -> {
            try {
                java.util.Map<String, Object> payload = java.util.Map.of(
                    "messId", messId.toString(),
                    "messName", finalMessName,
                    "lunchMenu", saved.getLunchMenu() != null ? saved.getLunchMenu() : "",
                    "dinnerMenu", saved.getDinnerMenu() != null ? saved.getDinnerMenu() : ""
                );
                String endpoint = agentUrl + "/agent/menu/broadcast";
                restTemplate.postForEntity(endpoint, payload, String.class);
            } catch (Exception e) {
                // Log and absorb to prevent interrupting database save flow
                System.err.println("Error broadcasting menu update to agent: " + e.getMessage());
            }
        });

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
