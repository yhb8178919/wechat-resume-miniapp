package com.example.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class DeepSeekService {

    private static final Logger log = LoggerFactory.getLogger(DeepSeekService.class);
    private static final int MAX_REQUESTS_PER_MINUTE = 10;
    private static final long RATE_LIMIT_WINDOW_MS = 60_000;

    private final String apiKey;
    private final String apiUrl;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, AtomicInteger> rateLimitMap = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lastCallTime = new ConcurrentHashMap<>();

    public DeepSeekService(
            @Value("${api.deepseek.key}") String apiKey,
            @Value("${api.deepseek.url}") String apiUrl,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.objectMapper = objectMapper;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(60000);
        this.restTemplate = new RestTemplate(factory);
    }

    public String callDeepSeekAPI(String prompt) {
        log.info("调用DeepSeek API, prompt长度: {}", prompt.length());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "deepseek-chat");
        requestBody.put("messages", List.of(Map.of("role", "user", "content", prompt)));
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 2000);

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    String content = choices.get(0).path("message").path("content").asText();
                    log.info("DeepSeek API调用成功, 响应长度: {}", content.length());
                    return content;
                }
            }
            log.error("DeepSeek API返回异常: {}", response.getBody());
            throw new RuntimeException("AI服务返回异常");
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("DeepSeek API调用失败", e);
            throw new RuntimeException("AI服务调用失败: " + e.getMessage(), e);
        }
    }

    public boolean checkRateLimit(String userId) {
        long currentTime = System.currentTimeMillis();
        Long lastTime = lastCallTime.get(userId);
        AtomicInteger counter = rateLimitMap.computeIfAbsent(userId, k -> new AtomicInteger(0));

        synchronized (counter) {
            if (lastTime != null && currentTime - lastTime > RATE_LIMIT_WINDOW_MS) {
                counter.set(0);
            }

            lastCallTime.put(userId, currentTime);

            if (counter.incrementAndGet() > MAX_REQUESTS_PER_MINUTE) {
                log.warn("用户 {} 调用频率超限", userId);
                return false;
            }
            return true;
        }
    }
}
