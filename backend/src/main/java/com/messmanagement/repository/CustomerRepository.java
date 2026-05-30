package com.messmanagement.repository;

import com.messmanagement.entity.Customer;
import com.messmanagement.entity.enums.CustomerStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    
    Page<Customer> findAllByMessId(UUID messId, Pageable pageable);
    
    long countByMessId(UUID messId);
    
    @Query("SELECT c FROM Customer c LEFT JOIN FETCH c.pauseHistory WHERE c.id = :id")
    Optional<Customer> findByIdWithPauseHistory(UUID id);
    
    long countByMessIdAndStatus(UUID messId, CustomerStatus status);
    
    @Query("SELECT SUM(c.totalMeals - c.mealsUsed) FROM Customer c WHERE c.mess.id = :messId AND c.status = 'Active'")
    Long countRemainingMealsByMessId(@org.springframework.data.repository.query.Param("messId") UUID messId);
    
    java.util.List<Customer> findAllByPhone(String phone);
    
    java.util.List<Customer> findAllByTelegramChatId(Long telegramChatId);

    Optional<Customer> findByMessIdAndPhone(UUID messId, String phone);

    Optional<Customer> findByMessIdAndTelegramChatId(UUID messId, Long telegramChatId);

    @Query("SELECT c FROM Customer c WHERE c.mess.id = :messId AND c.status = :status AND c.plan IN :plans " +
           "AND NOT EXISTS (SELECT 1 FROM AttendanceLog al WHERE al.customer.id = c.id AND al.date = :date AND al.meal = :meal)")
    java.util.List<Customer> findActiveCustomersForAutoMark(
            @org.springframework.data.repository.query.Param("messId") UUID messId,
            @org.springframework.data.repository.query.Param("status") CustomerStatus status,
            @org.springframework.data.repository.query.Param("plans") java.util.Collection<com.messmanagement.entity.enums.MealPlan> plans,
            @org.springframework.data.repository.query.Param("date") java.time.LocalDate date,
            @org.springframework.data.repository.query.Param("meal") com.messmanagement.entity.enums.MealPlan meal
    );

    @Query("SELECT SUM(CASE WHEN c.plan = 'Lunch' THEN 1 WHEN c.plan = 'Dinner' THEN 1 WHEN c.plan = 'Both' THEN 2 ELSE 0 END) " +
           "FROM Customer c WHERE c.mess.id = :messId AND c.status = 'Active'")
    Long countExpectedMealsTodayByMessId(@org.springframework.data.repository.query.Param("messId") UUID messId);

    java.util.List<Customer> findAllByTelegramChatIdIsNotNull();

    @Query("SELECT c FROM Customer c WHERE c.amountDue > 0 AND c.telegramChatId IS NOT NULL AND c.status = com.messmanagement.entity.enums.CustomerStatus.Active")
    java.util.List<Customer> findCustomersWithDuePayments();

    @Query("SELECT c FROM Customer c WHERE c.status = com.messmanagement.entity.enums.CustomerStatus.Active AND (c.totalMeals - c.mealsUsed) <= :threshold AND c.telegramChatId IS NOT NULL")
    java.util.List<Customer> findCustomersNearExpiry(@org.springframework.data.repository.query.Param("threshold") int threshold);
}
