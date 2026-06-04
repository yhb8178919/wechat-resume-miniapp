package com.example.controller;

import com.example.service.DeepSeekService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
public class DeepSeekController {

    private static final Logger log = LoggerFactory.getLogger(DeepSeekController.class);

    private final DeepSeekService deepSeekService;

    public DeepSeekController(DeepSeekService deepSeekService) {
        this.deepSeekService = deepSeekService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authToken) {

        String userId = extractUserId(authToken);
        log.info("收到AI请求, userId: {}", userId);

        String prompt = request.get("prompt");
        if (prompt == null || prompt.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("code", 400, "message", "prompt不能为空"));
        }

        try {
            if (!deepSeekService.checkRateLimit(userId)) {
                return ResponseEntity.status(429)
                        .body(Map.of("code", 429, "message", "调用频率超限，请稍后再试"));
            }

            String response = deepSeekService.callDeepSeekAPI(prompt.trim());

            return ResponseEntity.ok(Map.of(
                    "code", 200,
                    "message", "调用成功",
                    "data", response
            ));

        } catch (Exception e) {
            log.error("AI服务调用异常", e);
            return ResponseEntity.status(500)
                    .body(Map.of("code", 500, "message", "AI服务调用失败：" + e.getMessage()));
        }
    }

    private String extractUserId(String token) {
        if (token != null && token.length() > 7 && token.startsWith("Bearer ")) {
            String tokenBody = token.substring(7);
            if (!tokenBody.isEmpty() && !"null".equals(tokenBody)) {
                return "user_" + Integer.toHexString(tokenBody.hashCode());
            }
        }
        return "anonymous_" + UUID.randomUUID().toString().substring(0, 8);
    }
}
