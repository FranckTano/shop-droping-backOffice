package com.shopdropping.backoffice.repository;

import com.shopdropping.backoffice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByRole(String role);
    boolean existsByUsername(String username);
}
