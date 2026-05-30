package com.messmanagement.controller;

import com.messmanagement.dto.request.AttendanceLogRequest;
import com.messmanagement.dto.response.AttendanceLogResponse;
import com.messmanagement.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
@Tag(name = "Attendance", description = "Attendance logging APIs")
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    
    @GetMapping
    @Operation(summary = "Get all attendance logs with pagination")
    public ResponseEntity<Page<AttendanceLogResponse>> getAllLogs(Pageable pageable) {
        return ResponseEntity.ok(attendanceService.getAllLogs(pageable));
    }
    
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get attendance logs for a specific customer")
    public ResponseEntity<List<AttendanceLogResponse>> getLogsByCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(attendanceService.getLogsByCustomer(customerId));
    }
    
    @PostMapping
    @Operation(summary = "Log an attendance action")
    public ResponseEntity<AttendanceLogResponse> logAttendance(@Valid @RequestBody AttendanceLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.logAttendance(request));
    }
    
    @GetMapping("/today/skipped")
    @Operation(summary = "Get count of skipped meals today")
    public ResponseEntity<Long> countSkippedToday() {
        return ResponseEntity.ok(attendanceService.countSkippedToday());
    }
    
    @GetMapping("/today/attended")
    @Operation(summary = "Get count of attended meals today")
    public ResponseEntity<Long> countAttendedToday() {
        return ResponseEntity.ok(attendanceService.countAttendedToday());
    }
}
