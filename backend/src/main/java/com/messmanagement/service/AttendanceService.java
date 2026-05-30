package com.messmanagement.service;

import com.messmanagement.dto.request.AttendanceLogRequest;
import com.messmanagement.dto.response.AttendanceLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AttendanceService {
    Page<AttendanceLogResponse> getAllLogs(Pageable pageable);
    List<AttendanceLogResponse> getLogsByCustomer(UUID customerId);
    AttendanceLogResponse logAttendance(AttendanceLogRequest request);
    long countSkippedToday();
    long countAttendedToday();
}
