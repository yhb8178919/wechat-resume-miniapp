package com.example.controller;

import com.example.service.ResumeHistoryService;
import com.example.service.StatisticsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/history")
public class HistoryController {

    private final ResumeHistoryService resumeHistoryService;
    private final StatisticsService statisticsService;

    public HistoryController(ResumeHistoryService resumeHistoryService,
                             StatisticsService statisticsService) {
        this.resumeHistoryService = resumeHistoryService;
        this.statisticsService = statisticsService;
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> getHistoryList(
            @RequestParam String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageResult = resumeHistoryService.getHistoryByUsername(username, page, size);
        return ResponseEntity.ok(Map.of(
                "records", pageResult.getContent(),
                "total", pageResult.getTotalElements(),
                "pages", pageResult.getTotalPages(),
                "current", page
        ));
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics(@RequestParam String username) {
        var stats = statisticsService.getStatistics(username);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/score-trend")
    public ResponseEntity<Map<String, Object>> getScoreTrend(@RequestParam String username) {
        var trend = statisticsService.getScoreTrend(username);
        return ResponseEntity.ok(Map.of("trend", trend));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteHistory(
            @PathVariable Long id,
            @RequestParam String username) {

        boolean success = resumeHistoryService.deleteHistory(id, username);
        if (success) {
            return ResponseEntity.ok(Map.of("code", 200, "message", "删除成功"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("code", 404, "message", "记录不存在或无权限"));
        }
    }

}