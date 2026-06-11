package com.example.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
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
    private static final int DEFAULT_MAX_TOKENS = 1200;

    private final String apiKey;
    private final String apiUrl;
    private final HttpClient httpClient;
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

        // JDK HttpClient with connection pooling (Java 17+)
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .version(java.net.http.HttpClient.Version.HTTP_1_1)
                .build();
    }

    /** 非流式调用 DeepSeek API */
    public String callDeepSeekAPI(String prompt) {
        return callDeepSeekAPI(prompt, DEFAULT_MAX_TOKENS);
    }

    /** 非流式调用，可指定 max_tokens */
    public String callDeepSeekAPI(String prompt, int maxTokens) {
        log.info("调用DeepSeek API, prompt长度: {}, maxTokens: {}", prompt.length(), maxTokens);

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "deepseek-chat");
            requestBody.put("messages", List.of(Map.of("role", "user", "content", prompt)));
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("stream", false);

            String json = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(java.net.URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .timeout(Duration.ofSeconds(90))
                    .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 && response.body() != null) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    String content = choices.get(0).path("message").path("content").asText();
                    log.info("DeepSeek API调用成功, 响应长度: {}", content.length());
                    return content;
                }
            }
            log.error("DeepSeek API返回异常, status: {}, body: {}", response.statusCode(), response.body());
            throw new RuntimeException("AI服务返回异常: HTTP " + response.statusCode());
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("DeepSeek API调用失败", e);
            throw new RuntimeException("AI服务调用失败: " + e.getMessage(), e);
        }
    }

    /** 流式调用 DeepSeek API，返回 StreamingResponseBody */
    public StreamingResponseBody callDeepSeekAPIStreaming(String prompt) {
        return callDeepSeekAPIStreaming(prompt, DEFAULT_MAX_TOKENS);
    }

    public StreamingResponseBody callDeepSeekAPIStreaming(String prompt, int maxTokens) {
        log.info("流式调用DeepSeek API, prompt长度: {}, maxTokens: {}", prompt.length(), maxTokens);

        return outputStream -> {
            try {
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", "deepseek-chat");
                requestBody.put("messages", List.of(Map.of("role", "user", "content", prompt)));
                requestBody.put("temperature", 0.7);
                requestBody.put("max_tokens", maxTokens);
                requestBody.put("stream", true);

                String json = objectMapper.writeValueAsString(requestBody);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(java.net.URI.create(apiUrl))
                        .header("Content-Type", "application/json")
                        .header("Authorization", "Bearer " + apiKey)
                        .timeout(Duration.ofSeconds(90))
                        .POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
                        .build();

                HttpResponse<java.io.InputStream> response = httpClient.send(
                        request, HttpResponse.BodyHandlers.ofInputStream());

                if (response.statusCode() != 200) {
                    outputStream.write(("ERROR: HTTP " + response.statusCode()).getBytes(StandardCharsets.UTF_8));
                    outputStream.flush();
                    return;
                }

                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("data: ")) {
                            String data = line.substring(6).trim();
                            if ("[DONE]".equals(data)) {
                                break;
                            }
                            try {
                                JsonNode node = objectMapper.readTree(data);
                                JsonNode choices = node.path("choices");
                                if (choices.isArray() && choices.size() > 0) {
                                    JsonNode delta = choices.get(0).path("delta");
                                    if (delta.has("content")) {
                                        String content = delta.get("content").asText();
                                        outputStream.write(content.getBytes(StandardCharsets.UTF_8));
                                        outputStream.flush();
                                    }
                                }
                            } catch (Exception e) {
                                log.debug("跳过无效SSE行: {}", line);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.error("流式调用失败", e);
                try {
                    outputStream.write(("ERROR: " + e.getMessage()).getBytes(StandardCharsets.UTF_8));
                    outputStream.flush();
                } catch (Exception ignored) {}
            }
        };
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
