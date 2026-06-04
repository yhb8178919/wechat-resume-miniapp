package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    /** 昵称 */
    @Column(length = 50)
    private String nickname;

    /** 手机号 */
    @Column(length = 20)
    private String phone;

    /** 头像URL */
    @Column(length = 500)
    private String avatar;

    /** 注册时间 */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ResumeHistory> resumeHistories;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.nickname == null || this.nickname.isEmpty()) {
            this.nickname = this.username;
        }
    }

}
