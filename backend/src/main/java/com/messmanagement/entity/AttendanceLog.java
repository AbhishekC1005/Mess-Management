package com.messmanagement.entity;

import com.messmanagement.entity.enums.ActionType;
import com.messmanagement.entity.enums.MealPlan;
import com.messmanagement.entity.enums.SourceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "attendance_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    
    @Column(nullable = false)
    private String customerName;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MealPlan meal;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType action;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SourceType source;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mess_id", nullable = false)
    private Mess mess;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
