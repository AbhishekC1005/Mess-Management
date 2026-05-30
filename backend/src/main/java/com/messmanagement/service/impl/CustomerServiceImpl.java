package com.messmanagement.service.impl;

import com.messmanagement.dto.request.CustomerRequest;
import com.messmanagement.dto.response.CustomerResponse;
import com.messmanagement.entity.Customer;
import com.messmanagement.entity.PauseHistory;
import com.messmanagement.entity.enums.CustomerStatus;
import com.messmanagement.exception.BadRequestException;
import com.messmanagement.exception.ResourceNotFoundException;
import com.messmanagement.mapper.CustomerMapper;
import com.messmanagement.repository.CustomerRepository;
import com.messmanagement.repository.MessRepository;
import com.messmanagement.security.SecurityUtils;
import com.messmanagement.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {
    
    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final MessRepository messRepository;
    
    private Customer getValidatedCustomer(UUID id) {
        UUID messId = SecurityUtils.getCurrentMessId();
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        if (customer.getMess() == null || !customer.getMess().getId().equals(messId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + id);
        }
        return customer;
    }
    
    private Customer getValidatedCustomerWithPauseHistory(UUID id) {
        UUID messId = SecurityUtils.getCurrentMessId();
        Customer customer = customerRepository.findByIdWithPauseHistory(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        if (customer.getMess() == null || !customer.getMess().getId().equals(messId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + id);
        }
        return customer;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        UUID messId = SecurityUtils.getCurrentMessId();
        return customerRepository.findAllByMessId(messId, pageable)
                .map(customerMapper::toResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(UUID id) {
        Customer customer = getValidatedCustomerWithPauseHistory(id);
        CustomerResponse response = customerMapper.toResponse(customer);
        response.setPauseHistory(customerMapper.toPauseHistoryResponseList(customer.getPauseHistory()));
        return response;
    }
    
    @Override
    public CustomerResponse createCustomer(CustomerRequest request) {
        UUID messId = SecurityUtils.getCurrentMessId();
        Customer customer = customerMapper.toEntity(request);
        customer.setMess(messRepository.getReferenceById(messId));
        
        if (request.getAmountDue() != null) {
            customer.setAmountDue(request.getAmountDue());
        }
        
        Customer saved = customerRepository.save(customer);
        return customerMapper.toResponse(saved);
    }
    
    @Override
    public CustomerResponse updateCustomer(UUID id, CustomerRequest request) {
        Customer customer = getValidatedCustomer(id);
        
        customerMapper.updateEntityFromRequest(request, customer);
        
        if (request.getAmountDue() != null) {
            customer.setAmountDue(request.getAmountDue());
        }
        
        Customer updated = customerRepository.save(customer);
        return customerMapper.toResponse(updated);
    }
    
    @Override
    public void deleteCustomer(UUID id) {
        Customer customer = getValidatedCustomer(id);
        customerRepository.delete(customer);
    }
    
    @Override
    public CustomerResponse updateCustomerStatus(UUID id, String statusStr) {
        Customer customer = getValidatedCustomer(id);
        
        try {
            CustomerStatus status = CustomerStatus.valueOf(statusStr);
            customer.setStatus(status);
            Customer updated = customerRepository.save(customer);
            return customerMapper.toResponse(updated);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + statusStr);
        }
    }
    
    @Override
    public CustomerResponse pauseCustomer(UUID id, LocalDate endDate) {
        Customer customer = getValidatedCustomerWithPauseHistory(id);
        
        if (customer.getStatus() == CustomerStatus.Paused) {
            throw new BadRequestException("Customer is already paused");
        }
        
        customer.setStatus(CustomerStatus.Paused);
        
        PauseHistory pauseHistory = new PauseHistory();
        pauseHistory.setCustomer(customer);
        pauseHistory.setStartDate(LocalDate.now());
        pauseHistory.setEndDate(endDate);
        
        customer.getPauseHistory().add(pauseHistory);
        
        Customer updated = customerRepository.save(customer);
        return getCustomerById(updated.getId());
    }
    
    @Override
    public CustomerResponse resumeCustomer(UUID id) {
        Customer customer = getValidatedCustomerWithPauseHistory(id);
        
        if (customer.getStatus() != CustomerStatus.Paused) {
            throw new BadRequestException("Customer is not paused");
        }
        
        customer.setStatus(CustomerStatus.Active);
        
        // Update the latest pause history with today's date as end date
        if (!customer.getPauseHistory().isEmpty()) {
            PauseHistory latest = customer.getPauseHistory().get(customer.getPauseHistory().size() - 1);
            if (latest.getEndDate() == null) {
                latest.setEndDate(LocalDate.now());
            }
        }
        
        Customer updated = customerRepository.save(customer);
        return getCustomerById(updated.getId());
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countByStatus(String statusStr) {
        UUID messId = SecurityUtils.getCurrentMessId();
        try {
            CustomerStatus status = CustomerStatus.valueOf(statusStr);
            return customerRepository.countByMessIdAndStatus(messId, status);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + statusStr);
        }
    }
}
