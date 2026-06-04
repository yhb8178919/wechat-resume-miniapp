package com.example.controller;

import com.example.entity.User;
import com.example.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    /** 获取个人资料 */
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long userId) {
        Optional<User> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("code", 404, "message", "用户不存在"));
        }
        return ResponseEntity.ok(Map.of("code", 200, "data", toUserMap(userOpt.get())));
    }

    /** 编辑个人资料 */
    @PutMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        try {
            String nickname = request.get("nickname");
            String phone = request.get("phone");
            String email = request.get("email");
            String avatar = request.get("avatar");

            User updated = userService.updateProfile(userId, nickname, phone, email, avatar);
            return ResponseEntity.ok(Map.of("code", 200, "message", "保存成功", "data", toUserMap(updated)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("code", 400, "message", e.getMessage()));
        }
    }

    /** 修改密码 */
    @PutMapping("/{userId}/password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        if (oldPassword == null || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("code", 400, "message", "新密码长度不能少于6位"));
        }

        boolean success = userService.changePassword(userId, oldPassword, newPassword);
        if (success) {
            return ResponseEntity.ok(Map.of("code", 200, "message", "密码修改成功"));
        } else {
            return ResponseEntity.badRequest()
                    .body(Map.of("code", 400, "message", "原密码错误"));
        }
    }

    private Map<String, Object> toUserMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("email", user.getEmail());
        map.put("nickname", user.getNickname() != null ? user.getNickname() : user.getUsername());
        map.put("phone", user.getPhone() != null ? user.getPhone() : "");
        map.put("avatar", user.getAvatar() != null ? user.getAvatar() : "");
        map.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
        return map;
    }
}
