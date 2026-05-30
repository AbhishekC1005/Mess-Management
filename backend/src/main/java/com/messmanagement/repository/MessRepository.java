package com.messmanagement.repository;

import com.messmanagement.entity.Mess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessRepository extends JpaRepository<Mess, UUID> {
}
