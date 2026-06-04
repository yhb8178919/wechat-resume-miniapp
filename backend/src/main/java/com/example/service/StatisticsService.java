package com.example.service;

import com.example.entity.ResumeHistory;
import com.example.repository.ResumeHistoryRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    private final ResumeHistoryService resumeHistoryService;
    private final ResumeHistoryRepository resumeHistoryRepository;

    public StatisticsService(ResumeHistoryService resumeHistoryService,
                             ResumeHistoryRepository resumeHistoryRepository) {
        this.resumeHistoryService = resumeHistoryService;
        this.resumeHistoryRepository = resumeHistoryRepository;
    }

    public Map<String, Object> getStatistics(String username) {
        long totalAnalysisCount = resumeHistoryService.getHistoryCountByUsername(username);

        Double averageScore = resumeHistoryRepository.getAverageScoreByUsername(username);
        if (averageScore == null) {
            averageScore = 0.0;
        }

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<ResumeHistory> recentHistories = resumeHistoryService
                .getHistoryByUsernameAndTimeRange(username, sevenDaysAgo);
        long recentAnalysisCount = recentHistories.size();

        ResumeHistory latest = resumeHistoryRepository
                .findTopByUserUsernameAndScoreIsNotNullOrderByAnalysisTimeDesc(username);
        Double latestScore = latest != null ? latest.getScore() : null;

        return Map.of(
                "totalAnalysisCount", totalAnalysisCount,
                "averageScore", Math.round(averageScore * 10.0) / 10.0,
                "recentAnalysisCount", recentAnalysisCount,
                "latestScore", latestScore
        );
    }

    public List<Map<String, Object>> getScoreTrend(String username) {
        List<ResumeHistory> histories = resumeHistoryService.getLatestHistoryByUsername(username, 10);
        return histories.stream()
                .filter(history -> history.getScore() != null)
                .map(history -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("date", history.getAnalysisTime());
                    map.put("score", history.getScore());
                    return map;
                })
                .collect(Collectors.toList());
    }

}