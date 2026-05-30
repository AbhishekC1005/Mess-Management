package com.messmanagement.mapper;

import com.messmanagement.dto.request.CustomerRequest;
import com.messmanagement.dto.response.CustomerResponse;
import com.messmanagement.dto.response.PauseHistoryResponse;
import com.messmanagement.entity.Customer;
import com.messmanagement.entity.PauseHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "mealsUsed", constant = "0")
    @Mapping(target = "skippedCount", constant = "0")
    @Mapping(target = "pauseHistory", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Customer toEntity(CustomerRequest request);
    
    CustomerResponse toResponse(Customer customer);
    
    List<CustomerResponse> toResponseList(List<Customer> customers);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "mealsUsed", ignore = true)
    @Mapping(target = "skippedCount", ignore = true)
    @Mapping(target = "pauseHistory", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(CustomerRequest request, @MappingTarget Customer customer);
    
    PauseHistoryResponse toPauseHistoryResponse(PauseHistory pauseHistory);
    
    List<PauseHistoryResponse> toPauseHistoryResponseList(List<PauseHistory> pauseHistories);
}
