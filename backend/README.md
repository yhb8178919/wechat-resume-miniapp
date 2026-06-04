# WeChat Mini Program Backend Service

This is a backend service for WeChat mini program, providing user authentication, resume analysis history management, and statistics functionality.

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/example/
│   │   │   ├── WechatObj1BackendApplication.java  # Main application class
│   │   │   ├── config/                           # Configuration files
│   │   │   ├── controller/                        # API controllers
│   │   │   ├── entity/                           # JPA entities
│   │   │   ├── repository/                        # JPA repositories
│   │   │   └── service/                          # Business logic services
│   │   └── resources/
│   │       └── application.properties            # Application configuration
│   └── test/                                     # Test files
├── target/                                       # Build output
├── pom.xml                                       # Maven configuration
└── README.md                                     # This document
```

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher

## Installation

1. **Clone the repository**

2. **Configure the database**
   - Create a MySQL database named `resume_db`
   - Update the database connection details in `src/main/resources/application.properties` if needed

3. **Build the project**
   ```bash
   mvn clean package
   ```

4. **Run the application**
   ```bash
   java -jar target/wechat-obj1-backend-1.0.0.jar
   ```

## API Endpoints

### Authentication

- **POST /api/auth/register** - Register a new user
  - Request body: `{"username": "用户名", "password": "密码", "email": "邮箱"}`
  - Response: `{"code": 200, "message": "注册成功"}` or `{"code": 400, "message": "用户名已存在"}`

- **POST /api/auth/login** - Login
  - Request body: `{"username": "用户名", "password": "密码"}`
  - Response: `{"code": 200, "message": "登录成功", "username": "用户名", "userId": 用户ID}` or `{"code": 401, "message": "用户名或密码错误"}`

- **GET /api/auth/check-username** - Check if username exists
  - Request parameter: `username`
  - Response: `{"exists": true/false}`

### History Management

- **GET /api/history/list** - Get history list
  - Request parameters: `username` (required), `page` (default 0), `size` (default 10)
  - Response: `{"records": [...], "total": 100, "pages": 10, "current": 0}`

- **GET /api/history/statistics** - Get statistics
  - Request parameter: `username`
  - Response: `{"totalAnalysisCount": 10, "averageScore": 85.5, "recentAnalysisCount": 5, "latestScore": 90.0}`

- **GET /api/history/score-trend** - Get score trend
  - Request parameter: `username`
  - Response: `{"trend": [{"date": "2023-01-01T12:00:00", "score": 85.0}, ...]}`

- **DELETE /api/history/{id}** - Delete history
  - Path parameter: `id` (history ID)
  - Request parameter: `username`
  - Response: `{"code": 200, "message": "删除成功"}` or `{"code": 404, "message": "记录不存在或无权限"}`

## Database Configuration

The database connection details are configured in `src/main/resources/application.properties`:

```properties
# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/resume_db?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=123456
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

## Security

- Passwords are encrypted using BCrypt
- CORS is enabled to allow requests from the WeChat mini program
- Basic security configurations are in place

## Notes

- The application uses Spring Boot 3.2.4
- JPA is used for database operations
- The application runs on port 8080 by default
- The DashScope API key is configured in application.properties for potential future use

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check the database connection details in application.properties
- Ensure the resume_db database exists
- Ensure the database user has the necessary permissions

### Compilation Errors
- Ensure Java 17 or higher is installed
- Ensure Maven is installed and configured correctly
- Run `mvn clean package` to rebuild the project

### Runtime Errors
- Check the application logs for detailed error messages
- Ensure all required dependencies are available
- Ensure the database is accessible
