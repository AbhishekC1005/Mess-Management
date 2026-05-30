package com.messmanagement.repository;

import com.messmanagement.entity.DailyMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyMenuRepository extends JpaRepository<DailyMenu, UUID> {
    Optional<DailyMenu> findByMessIdAndDate(UUID messId, LocalDate date);
}
