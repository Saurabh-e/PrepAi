# AI Interview Preparation Platform - Backend

A production-ready RESTful backend for an AI-powered interview preparation platform built with Spring Boot 3.x, MongoDB, and Groq AI API.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)

## ✨ Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Refresh token mechanism
- BCrypt password encryption
- Role-based access control (USER, ADMIN)

### User Management
- View and update user profile
- Change password
- Upload profile image (stored locally)
- Manage skills and experience

### Resume Management
- Upload resume (PDF/DOCX)
- Store resume locally (similar to Multer in Node.js)
- Extract text using Apache PDFBox and Apache POI
- Parse skills from resume
- View resume history

### AI Interview Module
- Start interview with customizable parameters
  - Job role selection
  - Domain selection (Java, Spring Boot, MERN, DSA, HR, SQL, JavaScript)
  - Difficulty level (Easy, Medium, Hard)
  - Number of questions
- AI-generated questions using Groq API
- Submit answers with real-time AI evaluation
- Scoring (0-10) with detailed feedback
- Technical and communication feedback
- Resume previous interview
- End interview with comprehensive summary

### Dashboard
- Total interviews count
- Average score analytics
- Highest score tracking
- Recent interviews list
- Performance trend (last 30 days)
- Weak topics identification
- Strong topics identification
- Skill analytics

### Notification System
- Interview completed notifications
- Resume uploaded notifications
- Profile updated notifications
- Mark as read functionality

### Admin Module
- View all users with pagination
- Search users by email
- Suspend/activate users
- Delete users
- Platform analytics
- AI usage statistics
- Domain distribution

## 🛠 Tech Stack

- **Java 21** - Programming language
- **Spring Boot 3.2.0** - Application framework
- **Spring Security** - Security framework
- **Spring Data MongoDB** - Data persistence
- **MongoDB** - NoSQL database
- **JWT (jjwt 0.12.3)** - Authentication tokens
- **Lombok** - Boilerplate code reduction
- **Bean Validation** - Input validation
- **Swagger/OpenAPI (springdoc 2.3.0)** - API documentation
- **Groq API** - LLM integration for AI features
- **Local File Storage** - File storage (similar to Multer in Node.js)
- **Apache PDFBox 3.0.1** - PDF text extraction
- **Apache POI 5.2.5** - DOCX text extraction
- **Maven** - Build tool
- **JUnit 5** - Testing framework
- **Mockito** - Mocking framework

## 🏗 Architecture

The application follows a clean layered architecture:

```
├── Controller Layer (REST API endpoints)
├── Service Layer (Business logic)
├── Repository Layer (Data access)
├── Model Layer (MongoDB documents)
├── DTO Layer (Data transfer objects)
├── Security Layer (Authentication & authorization)
├── Configuration Layer (App configuration)
├── Exception Layer (Error handling)
└── Utility Layer (Helper classes)
```

## 📋 Prerequisites

- Java 21 or higher
- Maven 3.6+
- MongoDB 4.4+ (running locally or remote)
- Groq API key (for AI features)

## 🚀 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ai-interview-platform
```

2. **Install dependencies**
```bash
mvn clean install
```

## ⚙ Configuration

Create or update `src/main/resources/application.properties`:

```properties
# Application
spring.application.name=ai-interview-platform
server.port=8080

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/ai_interview_platform

# JWT
jwt.secret=your-super-secret-key-change-this-in-production-min-256-bits
jwt.expiration=86400000
jwt.refresh.expiration=604800000

# File Storage (Local)
file.upload-dir=uploads
file.base-url=http://localhost:8080/uploads

# Groq API
groq.api.key=your-groq-api-key
groq.model=llama-3.3-70b-versatile
groq.max.tokens=2048
groq.temperature=0.7

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Environment Variables

You can also use environment variables:

- `JWT_SECRET` - JWT secret key
- `FILE_UPLOAD_DIR` - Upload directory path (default: uploads)
- `FILE_BASE_URL` - Base URL for accessing files
- `GROQ_API_KEY` - Groq API key
- `GROQ_MODEL` - Groq model (optional)

## 🏃 Running the Application

### Using Maven

```bash
mvn spring-boot:run
```

### Using Java

```bash
mvn clean package
java -jar target/ai-interview-platform-1.0.0.jar
```

The application will start on `http://localhost:8080`

## 📚 API Documentation

Once the application is running, access the Swagger UI:

```
http://localhost:8080/swagger-ui.html
```

API docs JSON:

```
http://localhost:8080/api-docs
```

## 📁 Project Structure

```
src/main/java/com/interview/
├── config/                     # Configuration classes
│   ├── CloudinaryConfig.java
│   ├── OpenApiConfig.java
│   ├── SecurityConfig.java
│   └── WebClientConfig.java
├── controller/                 # REST controllers
│   ├── AdminController.java
│   ├── AuthController.java
│   ├── DashboardController.java
│   ├── InterviewController.java
│   ├── NotificationController.java
│   ├── ResumeController.java
│   └── UserController.java
├── dto/                        # Data Transfer Objects
│   ├── ApiResponse.java
│   ├── AuthRequest.java
│   ├── AuthResponse.java
│   ├── RegisterRequest.java
│   ├── UpdateProfileRequest.java
│   ├── ChangePasswordRequest.java
│   ├── StartInterviewRequest.java
│   ├── SubmitAnswerRequest.java
│   ├── InterviewDTO.java
│   ├── QuestionDTO.java
│   ├── AnswerDTO.java
│   ├── ResumeDTO.java
│   ├── UserProfileDTO.java
│   └── DashboardDTO.java
├── exception/                  # Exception handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── BadRequestException.java
│   └── UnauthorizedException.java
├── model/                      # MongoDB entities
│   ├── User.java
│   ├── RefreshToken.java
│   ├── Interview.java
│   ├── Question.java
│   ├── Answer.java
│   ├── Resume.java
│   ├── Feedback.java
│   ├── Progress.java
│   └── Notification.java
├── repository/                 # Data repositories
│   ├── UserRepository.java
│   ├── RefreshTokenRepository.java
│   ├── InterviewRepository.java
│   ├── QuestionRepository.java
│   ├── AnswerRepository.java
│   ├── ResumeRepository.java
│   ├── FeedbackRepository.java
│   ├── ProgressRepository.java
│   └── NotificationRepository.java
├── security/                   # Security components
│   ├── JwtUtil.java
│   ├── JwtAuthenticationFilter.java
│   ├── JwtAuthenticationEntryPoint.java
│   ├── CustomUserDetailsService.java
│   └── SecurityConfig.java
├── service/                    # Business logic
│   ├── AuthService.java
│   ├── UserService.java
│   ├── InterviewService.java
│   ├── ResumeService.java
│   ├── NotificationService.java
│   ├── DashboardService.java
│   ├── AdminService.java
│   ├── CloudinaryService.java
│   ├── GroqAIService.java
│   └── RefreshTokenService.java
├── util/                       # Utility classes
│   ├── ModelMapper.java
│   └── SecurityUtils.java
└── AiInterviewPlatformApplication.java
```

## 🧪 Testing

Run unit tests:

```bash
mvn test
```

Run integration tests:

```bash
mvn verify
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user

### User Management
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `POST /api/v1/users/change-password` - Change password
- `POST /api/v1/users/profile-image` - Upload profile image
- `POST /api/v1/users/skills` - Add skill
- `DELETE /api/v1/users/skills` - Remove skill

### Resume
- `POST /api/v1/resumes/upload` - Upload resume
- `GET /api/v1/resumes` - Get all resumes
- `GET /api/v1/resumes/latest` - Get latest resume
- `DELETE /api/v1/resumes/{id}` - Delete resume

### Interview
- `POST /api/v1/interviews/start` - Start interview
- `GET /api/v1/interviews/current` - Get current interview
- `GET /api/v1/interviews/next-question` - Get next question
- `POST /api/v1/interviews/submit-answer` - Submit answer
- `POST /api/v1/interviews/{id}/end` - End interview
- `GET /api/v1/interviews/history` - Get interview history
- `GET /api/v1/interviews/{id}` - Get interview details

### Dashboard
- `GET /api/v1/dashboard` - Get user dashboard

### Notifications
- `GET /api/v1/notifications` - Get all notifications
- `GET /api/v1/notifications/unread` - Get unread notifications
- `GET /api/v1/notifications/unread/count` - Get unread count
- `PATCH /api/v1/notifications/{id}/read` - Mark as read
- `PATCH /api/v1/notifications/read-all` - Mark all as read

### Admin (ADMIN role required)
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/users/search` - Search users
- `GET /api/v1/admin/users/{id}` - Get user by ID
- `PATCH /api/v1/admin/users/{id}/suspend` - Suspend user
- `PATCH /api/v1/admin/users/{id}/activate` - Activate user
- `DELETE /api/v1/admin/users/{id}` - Delete user
- `GET /api/v1/admin/analytics` - Get platform analytics
- `GET /api/v1/admin/ai-usage` - Get AI usage statistics

## 📝 MongoDB Collections

- **users** - User accounts
- **refresh_tokens** - JWT refresh tokens
- **interviews** - Interview sessions
- **questions** - Interview questions
- **answers** - User answers with AI evaluation
- **resumes** - Resume metadata
- **feedback** - Interview feedback
- **progress** - User progress tracking
- **notifications** - User notifications

## 🔐 Security

- JWT-based authentication with access and refresh tokens
- BCrypt password encryption
- Role-based access control (USER, ADMIN)
- CORS configuration for frontend integration
- Input validation on all endpoints
- Global exception handling
- Secure file upload with size limits

## 🤖 Groq AI Integration

Supported models:
- `llama-3.3-70b-versatile` (default)
- `llama-3.1-8b-instant`
- `meta-llama/llama-4-scout-17b-16e-instruct`
- `qwen/qwen3-32b`

AI capabilities:
- Generate personalized interview questions
- Evaluate answers with scoring
- Provide technical feedback
- Assess communication quality
- Suggest improvements
- Recommend learning resources
- Generate interview summaries

## 📧 Contact

For questions or support, contact: support@aiinterview.com

## 📄 License

This project is licensed under the Apache 2.0 License.

---

Built with ❤️ using Spring Boot and Groq AI
