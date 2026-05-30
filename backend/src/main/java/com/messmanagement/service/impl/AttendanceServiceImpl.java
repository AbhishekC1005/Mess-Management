package com.messmanagement.service.impl;

import com.messmanagement.dto.request.AttendanceLogRequest;
import com.messmanagement.dto.response.AttendanceLogResponse;
import com.messmanagement.entity.AttendanceLog;
import com.messmanagement.entity.Customer;
import com.messmanagement.entity.enums.ActionType;
import com.messmanagement.entity.enums.CustomerStatus;
import com.messmanagement.exception.BadRequestException;
import com.messmanagement.exception.ResourceNotFoundException;
import com.messmanagement.mapper.AttendanceLogMapper;
import com.messmanagement.repository.AttendanceLogRepository;
import com.messmanagement.repository.CustomerRepository;
import com.messmanagement.security.SecurityUtils;
import com.messmanagement.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceServiceImpl implements AttendanceService {
    
    private final AttendanceLogRepository attendanceLogRepository;
    private final CustomerRepository customerRepository;
    private final AttendanceLogMapper attendanceLogMapper;
    
    @Override
    @Transactional(readOnly = true)
    public Page<AttendanceLogResponse> getAllLogs(Pageable pageable) {
        UUID messId = SecurityUtils.getCurrentMessId();
        return attendanceLogRepository.findAllByMessIdOrderByDateDesc(messId, pageable)
                .map(attendanceLogMapper::toResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<AttendanceLogResponse> getLogsByCustomer(UUID customerId) {
        UUID messId = SecurityUtils.getCurrentMessId();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
        if (customer.getMess() == null || !customer.getMess().getId().equals(messId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }
        
        return attendanceLogMapper.toResponseList(
                attendanceLogRepository.findByCustomerIdOrderByDateDesc(customerId)
        );
    }
    
    @Override
    public AttendanceLogResponse logAttendance(AttendanceLogRequest request) {
        UUID messId = SecurityUtils.getCurrentMessId();
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        if (customer.getMess() == null || !customer.getMess().getId().equals(messId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId());
        }
        
        // Skip if customer is paused and trying to attend
        if (customer.getStatus() == CustomerStatus.Paused && request.getAction() != ActionType.Paused) {
            throw new BadRequestException("Customer is paused and cannot attend meals");
        }
        
        AttendanceLog log = attendanceLogMapper.toEntity(request);
        log.setCustomer(customer);
        log.setCustomerName(customer.getName());
        log.setMess(customer.getMess());
        
        // Update customer stats based on action
        updateCustomerStats(customer, request.getAction());
        
        customerRepository.save(customer);
        AttendanceLog saved = attendanceLogRepository.save(log);
        
        return attendanceLogMapper.toResponse(saved);
    }
    
    private void updateCustomerStats(Customer customer, ActionType action) {
        switch (action) {
            case Skipped -> {
                customer.setSkippedCount(customer.getSkippedCount() + 1);
            }
            case Resumed -> {
                if (customer.getStatus() == CustomerStatus.Paused) {
                    customer.setStatus(CustomerStatus.Active);
                }
            }
            case Paused -> {
                customer.setStatus(CustomerStatus.Paused);
            }
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countSkippedToday() {
        UUID messId = SecurityUtils.getCurrentMessId();
        return attendanceLogRepository.countSkippedByMessIdAndDate(messId, LocalDate.now());
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countAttendedToday() {
        UUID messId = SecurityUtils.getCurrentMessId();
        return attendanceLogRepository.countAttendedByMessIdAndDate(messId, LocalDate.now());
    }
}
