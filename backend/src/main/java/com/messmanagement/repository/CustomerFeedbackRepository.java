package com.messmanagement.repository;

import com.messmanagement.entity.CustomerFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CustomerFeedbackRepository extends JpaRepository<CustomerFeedback, UUID> {
}
