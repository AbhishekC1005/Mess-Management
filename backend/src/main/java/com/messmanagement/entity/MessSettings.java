package com.messmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "mess_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private java.time.LocalTime lunchCutoffTime;
    
    @Column(nullable = false)
    private java.time.LocalTime dinnerCutoffTime;
    
    @Column(nullable = false)
    private Boolean autoMarkEnabled = true;
    
    @Column(nullable = false)
    private String timezone = "Asia/Kolkata";
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mess_id", nullable = false, unique = true)
    private Mess mess;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
