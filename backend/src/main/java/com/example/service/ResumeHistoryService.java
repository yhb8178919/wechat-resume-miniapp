package com.example.service;

import com.example.entity.ResumeHistory;
import com.example.entity.User;
import com.example.repository.ResumeHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ResumeHistoryService {

    private static final Logger log = LoggerFactory.getLogger(ResumeHistoryService.class);

    private final ResumeHistoryRepository resumeHistoryRepository;
    private final UserService userService;

    public ResumeHistoryService(ResumeHistoryRepository resumeHistoryRepository,
                                UserService userService) {
        this.resumeHistoryRepository = resumeHistoryRepository;
        this.userService = userService;
    }

    public ResumeHistory saveHistory(String username, String fileName, String content, String analysisResult, Double score) {
        Optional<User> userOptional = userService.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            ResumeHistory history = new ResumeHistory();
            history.setUser(user);
            history.setFileName(fileName);
            history.setContent(content);
            history.setAnalysisResult(analysisResult);
            history.setScore(score);
            return resumeHistoryRepository.save(history);
        }
        return null;
    }

    public Page<ResumeHistory> getHistoryByUsername(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return resumeHistoryRepository.findByUserUsername(username, pageable);
    }

    public List<ResumeHistory> getLatestHistoryByUsername(String username, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return resumeHistoryRepository.findByUserUsernameOrderByAnalysisTimeDesc(username, pageable);
    }

    public List<ResumeHistory> getHistoryByUsernameAndTimeRange(String username, LocalDateTime startDate) {
        return resumeHistoryRepository.findByUserUsernameAndAnalysisTimeAfter(username, startDate);
    }

    public long getHistoryCountByUsername(String username) {
        return resumeHistoryRepository.countByUserUsername(username);
    }

    public boolean deleteHistory(Long id, String username) {
        Optional<ResumeHistory> historyOptional = resumeHistoryRepository.findById(id);
        if (historyOptional.isPresent()) {
            ResumeHistory history = historyOptional.get();
            if (history.getUser().getUsername().equals(username)) {
                resumeHistoryRepository.delete(history);
                return true;
            }
        }
        return false;
    }

    public Optional<ResumeHistory> getHistoryById(Long id) {
        return resumeHistoryRepository.findById(id);
    }

}