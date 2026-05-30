package com.messmanagement.mapper;

import com.messmanagement.dto.request.AttendanceLogRequest;
import com.messmanagement.dto.response.AttendanceLogResponse;
import com.messmanagement.entity.AttendanceLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AttendanceLogMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    AttendanceLog toEntity(AttendanceLogRequest request);
    
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", source = "customerName")
    AttendanceLogResponse toResponse(AttendanceLog attendanceLog);
    
    List<AttendanceLogResponse> toResponseList(List<AttendanceLog> attendanceLogs);
}
