package com.messmanagement.controller;

import com.messmanagement.dto.request.CustomerRequest;
import com.messmanagement.dto.response.CustomerResponse;
import com.messmanagement.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer management APIs")
public class CustomerController {
    
    private final CustomerService customerService;
    
    @GetMapping
    @Operation(summary = "Get all customers with pagination")
    public ResponseEntity<Page<CustomerResponse>> getAllCustomers(Pageable pageable) {
        return ResponseEntity.ok(customerService.getAllCustomers(pageable));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create a new customer")
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.createCustomer(request));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update customer details")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable UUID id,
                                                         @Valid @RequestBody CustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a customer")
    public ResponseEntity<Void> deleteCustomer(@PathVariable UUID id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update customer status")
    public ResponseEntity<CustomerResponse> updateCustomerStatus(@PathVariable UUID id,
                                                               @RequestParam String status) {
        return ResponseEntity.ok(customerService.updateCustomerStatus(id, status));
    }
    
    @PostMapping("/{id}/pause")
    @Operation(summary = "Pause customer meals")
    public ResponseEntity<CustomerResponse> pauseCustomer(@PathVariable UUID id,
                                                       @RequestParam(required = false) String endDate) {
        LocalDate pauseEndDate = endDate != null ? LocalDate.parse(endDate) : null;
        return ResponseEntity.ok(customerService.pauseCustomer(id, pauseEndDate));
    }
    
    @PostMapping("/{id}/resume")
    @Operation(summary = "Resume customer meals")
    public ResponseEntity<CustomerResponse> resumeCustomer(@PathVariable UUID id) {
        return ResponseEntity.ok(customerService.resumeCustomer(id));
    }
    
    @GetMapping("/count-by-status")
    @Operation(summary = "Count customers by status")
    public ResponseEntity<Long> countByStatus(@RequestParam String status) {
        return ResponseEntity.ok(customerService.countByStatus(status));
    }
}
