package com.example.repository;

import com.example.entity.ResumeHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ResumeHistoryRepository extends JpaRepository<ResumeHistory, Long> {

    Page<ResumeHistory> findByUserUsername(String username, Pageable pageable);

    List<ResumeHistory> findByUserUsernameOrderByAnalysisTimeDesc(String username, Pageable pageable);

    List<ResumeHistory> findByUserUsernameAndAnalysisTimeAfter(String username, LocalDateTime startDate);

    long countByUserUsername(String username);

    @Query("SELECT AVG(r.score) FROM ResumeHistory r WHERE r.user.username = :username AND r.score IS NOT NULL")
    Double getAverageScoreByUsername(@Param("username") String username);

    ResumeHistory findTopByUserUsernameAndScoreIsNotNullOrderByAnalysisTimeDesc(String username);

}