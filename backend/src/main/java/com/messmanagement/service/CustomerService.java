package com.messmanagement.service;

import com.messmanagement.dto.request.CustomerRequest;
import com.messmanagement.dto.response.CustomerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.UUID;

public interface CustomerService {
    Page<CustomerResponse> getAllCustomers(Pageable pageable);
    CustomerResponse getCustomerById(UUID id);
    CustomerResponse createCustomer(CustomerRequest request);
    CustomerResponse updateCustomer(UUID id, CustomerRequest request);
    void deleteCustomer(UUID id);
    CustomerResponse updateCustomerStatus(UUID id, String status);
    CustomerResponse pauseCustomer(UUID id, LocalDate endDate);
    CustomerResponse resumeCustomer(UUID id);
    long countByStatus(String status);
}
