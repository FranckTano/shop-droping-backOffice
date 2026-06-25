package com.shopdropping.backoffice.repository;

import com.shopdropping.backoffice.entity.AuditLog;
import com.shopdropping.backoffice.entity.TypeEntite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
            select a from AuditLog a
            where (:username is null or a.adminUsername = :username)
              and (:typeEntite is null or a.typeEntite = :typeEntite)
              and (:depuis is null or a.createdAt >= :depuis)
            order by a.createdAt desc
            """)
    Page<AuditLog> filtrer(
            @Param("username") String username,
            @Param("typeEntite") TypeEntite typeEntite,
            @Param("depuis") LocalDateTime depuis,
            Pageable pageable
    );
}
