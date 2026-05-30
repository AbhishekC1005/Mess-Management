package com.messmanagement.repository;

import com.messmanagement.entity.MessSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessSettingsRepository extends JpaRepository<MessSettings, UUID> {
    java.util.Optional<MessSettings> findByMessId(UUID messId);

    @org.springframework.data.jpa.repository.Query("SELECT ms FROM MessSettings ms JOIN FETCH ms.mess")
    java.util.List<MessSettings> findAllWithMess();
}
