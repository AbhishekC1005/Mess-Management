package com.messmanagement.repository;

import com.messmanagement.entity.AttendanceLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceLogRepository extends JpaRepository<AttendanceLog, UUID> {
    
    Page<AttendanceLog> findAllByMessIdOrderByDateDesc(UUID messId, Pageable pageable);
    
    List<AttendanceLog> findByCustomerIdOrderByDateDesc(UUID customerId);
    
    @Query("SELECT a FROM AttendanceLog a WHERE a.mess.id = :messId AND a.date = :date ORDER BY a.createdAt DESC")
    List<AttendanceLog> findByMessIdAndDate(@Param("messId") UUID messId, @Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM AttendanceLog a WHERE a.mess.id = :messId AND a.date = :date AND a.action = 'Skipped'")
    long countSkippedByMessIdAndDate(@Param("messId") UUID messId, @Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM AttendanceLog a WHERE a.mess.id = :messId AND a.date = :date AND a.action != 'Skipped'")
    long countAttendedByMessIdAndDate(@Param("messId") UUID messId, @Param("date") LocalDate date);
    
    @Query("SELECT a FROM AttendanceLog a WHERE a.mess.id = :messId ORDER BY a.date DESC, a.createdAt DESC")
    List<AttendanceLog> findRecentActivityByMessId(@Param("messId") UUID messId, Pageable pageable);
    
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM AttendanceLog a WHERE a.customer.id = :customerId AND a.date = :date AND a.meal = :meal")
    boolean existsByCustomerIdAndDateAndMeal(@Param("customerId") UUID customerId, @Param("date") LocalDate date, @Param("meal") com.messmanagement.entity.enums.MealPlan meal);

    @Query("SELECT a FROM AttendanceLog a WHERE a.customer.id = :customerId AND a.date = :date AND a.meal = :meal")
    java.util.Optional<AttendanceLog> findByCustomerIdAndDateAndMeal(@Param("customerId") UUID customerId, @Param("date") LocalDate date, @Param("meal") com.messmanagement.entity.enums.MealPlan meal);
}
