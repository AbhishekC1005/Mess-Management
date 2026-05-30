package com.messmanagement.service.impl;

import com.messmanagement.dto.response.AttendanceLogResponse;
import com.messmanagement.dto.response.DashboardStatsResponse;
import com.messmanagement.entity.enums.CustomerStatus;
import com.messmanagement.mapper.AttendanceLogMapper;
import com.messmanagement.repository.AttendanceLogRepository;
import com.messmanagement.repository.CustomerRepository;
import com.messmanagement.security.SecurityUtils;
import com.messmanagement.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {
    
    private final CustomerRepository customerRepository;
    private final AttendanceLogRepository attendanceLogRepository;
    private final AttendanceLogMapper attendanceLogMapper;
    
    @Override
    public DashboardStatsResponse getDashboardStats() {
        UUID messId = SecurityUtils.getCurrentMessId();
        long totalCustomers = customerRepository.countByMessId(messId);
        long pausedCustomers = customerRepository.countByMessIdAndStatus(messId, CustomerStatus.Paused);
        
        LocalDate today = LocalDate.now();
        long skippedToday = attendanceLogRepository.countSkippedByMessIdAndDate(messId, today);
        
        Long expectedMealsTodayVal = customerRepository.countExpectedMealsTodayByMessId(messId);
        long expectedMealsToday = expectedMealsTodayVal != null ? expectedMealsTodayVal : 0L;
        long mealsToday = Math.max(0L, expectedMealsToday - skippedToday);
        
        return new DashboardStatsResponse(totalCustomers, mealsToday, skippedToday, pausedCustomers);
    }
    
    @Override
    public List<AttendanceLogResponse> getRecentActivity(int limit) {
        UUID messId = SecurityUtils.getCurrentMessId();
        Pageable pageable = PageRequest.of(0, limit);
        return attendanceLogMapper.toResponseList(
                attendanceLogRepository.findRecentActivityByMessId(messId, pageable)
        );
    }
}
