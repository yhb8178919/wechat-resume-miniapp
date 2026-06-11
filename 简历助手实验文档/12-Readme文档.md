# 智能简历助手 - 微信小程序

基于 AI 大模型的智能简历生成与管理微信小程序，帮助求职者轻松制作专业简历。

## 功能概览

| 功能模块 | 说明 |
|---------|------|
| 智能简历生成 | 输入个人信息（姓名、专业、经历），AI自动生成专业简历 |
| 简历质量评估 | 多维度评估简历质量，提供优化建议 |
| 职业方向推荐 | 基于简历内容推荐匹配职业方向 |
| 面试模拟练习 | 模拟面试问答，提升面试应对能力 |
| 简历历史管理 | 保存和回顾简历生成/评估/工具使用历史（5个Tab） |
| 实用求职工具 | 简历模板、面试题库、薪资查询、技能测评（本地AI页面） |
| 求职资讯服务 | 求职攻略、行业分析、职场百科、名企直通车（本地AI页面） |

## 技术架构

```
前端：微信小程序 (WebView渲染引擎 + 自定义导航栏)
后端：Spring Boot 3.2.4 + Java 17
数据库：MySQL 8.0 + Spring Data JPA
AI服务：DeepSeek Chat API
安全：Spring Security + CORS
```

## 项目结构

```
wechat_obj1/
├── backend/                          # Spring Boot 后端
│   ├── src/main/java/com/example/
│   │   ├── config/                   # 安全配置 (SecurityConfig)
│   │   ├── controller/               # REST 控制器
│   │   ├── AuthController.java   # 用户认证接口
│   │   ├── DeepSeekController.java  # AI 服务接口（流式+非流式）
│   │   ├── HistoryController.java   # 历史记录接口
│   │   └── ProfileController.java   # 个人信息接口
│   │   ├── entity/                   # 数据实体
│   │   │   ├── User.java
│   │   │   └── ResumeHistory.java
│   │   ├── repository/               # 数据访问层
│   │   │   ├── UserRepository.java
│   │   │   └── ResumeHistoryRepository.java
│   │   └── service/                  # 业务逻辑层
│   │       ├── UserService.java
│   │       ├── DeepSeekService.java
│   │       ├── ResumeHistoryService.java
│   │       └── StatisticsService.java
│   ├── src/main/resources/
│   │   └── application.properties    # 应用配置
│   └── pom.xml                       # Maven 依赖
├── pages/                            # 小程序页面 (21个)
│   ├── index/                        # 首页
│   ├── page1/                        # 简历生成
│   ├── page2/                        # 简历评估
│   ├── career/                       # 职业推荐
│   ├── defense/                      # 面试模拟
│   ├── page3/                        # 个人中心
│   ├── page4/                        # 历史记录
│   ├── page5/                        # 简历模板（本地AI）
│   ├── page6/                        # 面试题库（本地AI）
│   ├── page7/                        # 薪资查询（本地AI）
│   ├── page8/                        # 技能测评（本地AI）
│   ├── page9/                        # 求职攻略（本地AI）
│   ├── page10/                       # 行业分析（本地AI）
│   ├── page11/                       # 职场百科（本地AI）
│   └── page12/                       # 名企直通车（本地AI）
├── components/                       # 自定义组件
│   └── navigation-bar/               # 导航栏
├── utils/                            # 工具类
│   └── api.js                        # HTTP 请求封装
├── 简历助手实验文档/               # 项目文档 (14份)
├── app.js / app.json / app.wxss       # 小程序全局配置
└── project.config.json               # 开发者工具配置
```

## 快速开始

### 环境要求

| 工具 | 版本要求 |
|------|---------|
| JDK | 17+ |
| MySQL | 8.0+ |
| Maven | 3.6+ |
| 微信开发者工具 | 最新稳定版 |
| Node.js | 16+ (可选) |

### 后端启动

1. **创建数据库**
```sql
CREATE DATABASE resume_db DEFAULT CHARACTER SET utf8mb4;
```

2. **配置数据库连接**

编辑 `backend/src/main/resources/application.properties`：
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/resume_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
```

3. **配置 DeepSeek API Key**
```properties
api.deepseek.key=your_deepseek_api_key
api.deepseek.url=https://api.deepseek.com/v1/chat/completions
```

4. **启动服务**
```bash
cd backend
mvn clean package
java -jar target/wechat-obj1-backend-1.0.0.jar
```

服务启动后默认运行在 `http://localhost:8080`

### 前端启动

1. 使用**微信开发者工具**打开项目根目录
2. 配置 AppID（在 `project.config.json` 中修改）
3. 点击编译预览

### API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| GET | /api/auth/check-username | 检查用户名 |
| POST | /api/ai/chat | AI对话接口（非流式） |
| POST | /api/ai/chat/stream | AI流式对话接口（边生成边推送） |
| GET | /api/profile | 获取个人信息 |
| PUT | /api/profile | 更新个人信息 |
| GET | /api/history | 查询历史记录 |
| DELETE | /api/history/{id} | 删除历史记录 |

## 配置说明

### 频率限制
- 单用户每分钟最多 10 次 AI 调用
- 可通过 `DeepSeekService.java` 中的 `MAX_REQUESTS_PER_MINUTE` 调整

### 超时设置
- HTTP 连接超时：10 秒
- API 读取超时：60 秒
- 小程序全局请求超时：120 秒
- AI流式传输：单次最多90秒，边生成边推送

### 生成速度优化
- max_tokens: 1200（平衡质量与速度）
- JDK HttpClient 连接池复用
- 流式传输优先，非流式降级

## 文档索引

| 序号 | 文档 | 说明 |
|------|------|------|
| 1 | [项目建议书](01-项目建议书.md) | 项目立项分析 |
| 2 | [可行性分析报告](02-可行性分析报告.md) | 技术/经济/法律可行性 |
| 3 | [需求规格说明书](03-需求规格说明书.md) | 功能与非功能需求 |
| 4 | [项目计划书](04-项目计划书.md) | WBS与里程碑 |
| 5 | [Agent文档](05-Agent文档.md) | AI Agent架构与设计 |
| 6 | [项目开发日志](06-项目开发日志.md) | 开发过程记录 |
| 7 | [版本更新日志](07-版本更新日志.md) | 版本变更记录 |
| 8 | [项目质量计划书](08-项目质量计划书.md) | 质量管理体系 |
| 9 | [项目质量检查报告](09-项目质量检查报告.md) | 质量检查结果 |
| 10 | [代码评审报告](10-代码评审报告.md) | 代码评审发现 |
| 11 | [安全评审报告](11-安全评审报告.md) | 安全审计结果 |
| 12 | README文档 | 本文件 |
| 13 | [测试用例与测试报告](13-测试用例与测试报告.md) | 测试情况汇总 |
| 14 | [项目验收报告](14-项目验收报告.md) | 项目验收结果 |

## 许可证

本项目仅用于学习和演示目的。

## 联系方式

GitHub: https://github.com/yhb8178919/wechat-resume-miniapp
