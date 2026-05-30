package com.messmanagement.controller;

import com.messmanagement.dto.request.DailyMenuRequest;
import com.messmanagement.dto.response.DailyMenuResponse;
import com.messmanagement.service.DailyMenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/menu")
@RequiredArgsConstructor
@Tag(name = "Menu", description = "Menu of the day APIs")
public class DailyMenuController {

    private final DailyMenuService dailyMenuService;

    @GetMapping
    @Operation(summary = "Get daily menu by date")
    public ResponseEntity<DailyMenuResponse> getMenu(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(dailyMenuService.getMenuByDate(queryDate));
    }

    @PutMapping
    @Operation(summary = "Create or update daily menu")
    public ResponseEntity<DailyMenuResponse> saveMenu(@Valid @RequestBody DailyMenuRequest request) {
        return ResponseEntity.ok(dailyMenuService.saveMenu(request));
    }
}
