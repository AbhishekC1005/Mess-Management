package com.messmanagement.entity;

import com.messmanagement.entity.enums.CustomerStatus;
import com.messmanagement.entity.enums.MealPlan;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MealPlan plan;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerStatus status = CustomerStatus.Active;
    
    @Column(nullable = false)
    private Integer mealsUsed = 0;
    
    @Column(nullable = false)
    private Integer totalMeals;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amountDue = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private LocalDate joinDate;
    
    @Column(nullable = false)
    private Integer skippedCount = 0;

    @Column
    private String phone;

    @Column
    private Long telegramChatId;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PauseHistory> pauseHistory = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mess_id", nullable = false)
    private Mess mess;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
