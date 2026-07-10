# Sample MongoDB Documents

## User Document

```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "email": "john.doe@example.com",
  "password": "$2a$10$abcdefghijklmnopqrstuvwxyz123456789",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "profileImageUrl": "http://localhost:8080/uploads/profile-images/abc123.jpg",
  "roles": ["USER"],
  "skills": ["Java", "Spring Boot", "MongoDB", "React"],
  "experience": {
    "currentRole": "Senior Software Engineer",
    "company": "Tech Corp",
    "yearsOfExperience": 5,
    "education": "B.Tech Computer Science"
  },
  "status": "ACTIVE",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-20T14:45:00",
  "lastLoginAt": "2024-01-20T09:15:00"
}
```

## Interview Document

```json
{
  "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "jobRole": "Senior Java Developer",
  "domain": "JAVA",
  "difficulty": "MEDIUM",
  "totalQuestions": 5,
  "completedQuestions": 5,
  "status": "COMPLETED",
  "questionIds": [
    "65c3d4e5f6g7h8i9j0k1l2m3",
    "65d4e5f6g7h8i9j0k1l2m3n4"
  ],
  "overallScore": 7.8,
  "overallFeedback": "Good performance overall",
  "aiModel": "llama-3.3-70b-versatile",
  "startedAt": "2024-01-20T10:00:00",
  "updatedAt": "2024-01-20T10:45:00",
  "completedAt": "2024-01-20T10:45:00",
  "durationMinutes": 45
}
```

## Question Document

```json
{
  "_id": "65c3d4e5f6g7h8i9j0k1l2m3",
  "interviewId": "65b2c3d4e5f6g7h8i9j0k1l2",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "questionNumber": 1,
  "questionText": "Explain the concept of dependency injection in Spring Boot and its benefits.",
  "questionType": "TECHNICAL",
  "difficulty": "MEDIUM",
  "aiGeneratedContext": "Spring Framework core concept",
  "askedAt": "2024-01-20T10:05:00"
}
```

## Answer Document

```json
{
  "_id": "65d4e5f6g7h8i9j0k1l2m3n4",
  "questionId": "65c3d4e5f6g7h8i9j0k1l2m3",
  "interviewId": "65b2c3d4e5f6g7h8i9j0k1l2",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "answerText": "Dependency Injection is a design pattern in Spring Boot where objects define their dependencies through constructor arguments, factory method arguments, or properties. It promotes loose coupling and makes code more testable.",
  "score": 8.5,
  "technicalFeedback": "Good understanding of DI concept. Mentioned key benefits including testability and loose coupling.",
  "communicationFeedback": "Clear and concise explanation. Well-structured answer.",
  "improvements": "Could expand on the different types of DI (constructor, setter, field injection) and when to use each.",
  "aiResponse": "Complete AI evaluation response...",
  "answeredAt": "2024-01-20T10:08:00",
  "responseTimeSeconds": 180
}
```

## Resume Document

```json
{
  "_id": "65e5f6g7h8i9j0k1l2m3n4o5",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "fileName": "John_Doe_Resume.pdf",
  "fileType": "application/pdf",
  "fileSize": 245678,
  "fileUrl": "http://localhost:8080/uploads/resumes/xyz789.pdf",
  "filePath": "resumes/xyz789.pdf",
  "extractedText": "JOHN DOE\nSenior Software Engineer\n...",
  "parsedSkills": [
    "java",
    "spring boot",
    "mongodb",
    "react",
    "docker",
    "kubernetes"
  ],
  "parsedData": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-234-567-8900",
    "education": ["B.Tech Computer Science, XYZ University"],
    "experience": [
      "Senior Software Engineer at Tech Corp (2020-Present)",
      "Software Engineer at StartUp Inc (2018-2020)"
    ],
    "certifications": ["AWS Certified Developer", "Oracle Java Certification"]
  },
  "uploadedAt": "2024-01-18T14:30:00"
}
```

## Feedback Document

```json
{
  "_id": "65f6g7h8i9j0k1l2m3n4o5p6",
  "interviewId": "65b2c3d4e5f6g7h8i9j0k1l2",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "overallScore": 7.8,
  "overallSummary": "Strong technical knowledge with good communication skills",
  "strengths": [
    "Solid understanding of Spring Boot concepts",
    "Good problem-solving approach",
    "Clear communication"
  ],
  "weaknesses": [
    "Could improve knowledge of microservices patterns",
    "Need more practice with system design"
  ],
  "recommendations": [
    "Study distributed systems architecture",
    "Practice designing scalable systems",
    "Review microservices design patterns"
  ],
  "learningResources": [
    {
      "topic": "Microservices Architecture",
      "resourceUrl": "https://microservices.io/",
      "description": "Comprehensive guide to microservices patterns"
    }
  ],
  "skillScores": {
    "java": 8.5,
    "spring-boot": 8.0,
    "system-design": 6.5
  },
  "communication": {
    "clarity": 8.0,
    "articulation": 7.5,
    "confidence": 8.5,
    "feedback": "Clear and confident communication style"
  },
  "createdAt": "2024-01-20T10:45:00"
}
```

## Progress Document

```json
{
  "_id": "660g7h8i9j0k1l2m3n4o5p6q7",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "totalInterviews": 10,
  "averageScore": 7.5,
  "highestScore": 9.2,
  "domainProgress": {
    "JAVA": {
      "interviewsCompleted": 5,
      "averageScore": 8.0,
      "lastDifficulty": "HARD"
    },
    "SPRING_BOOT": {
      "interviewsCompleted": 3,
      "averageScore": 7.5,
      "lastDifficulty": "MEDIUM"
    },
    "DSA": {
      "interviewsCompleted": 2,
      "averageScore": 6.5,
      "lastDifficulty": "MEDIUM"
    }
  },
  "skillAnalytics": {
    "java": {
      "averageScore": 8.5,
      "timesAssessed": 8,
      "strength": "STRONG"
    },
    "spring-boot": {
      "averageScore": 7.8,
      "timesAssessed": 6,
      "strength": "MODERATE"
    },
    "system-design": {
      "averageScore": 6.2,
      "timesAssessed": 4,
      "strength": "WEAK"
    }
  },
  "lastUpdated": "2024-01-20T10:45:00"
}
```

## Notification Document

```json
{
  "_id": "661h8i9j0k1l2m3n4o5p6q7r8",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "type": "INTERVIEW_COMPLETED",
  "title": "Interview Completed",
  "message": "Your interview for Senior Java Developer has been completed with a score of 7.8/10",
  "isRead": false,
  "createdAt": "2024-01-20T10:45:00",
  "readAt": null
}
```

## RefreshToken Document

```json
{
  "_id": "662i9j0k1l2m3n4o5p6q7r8s9",
  "token": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "expiryDate": "2024-01-27T10:30:00",
  "createdAt": "2024-01-20T10:30:00"
}
```
