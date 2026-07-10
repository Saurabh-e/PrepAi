# Application Setup Guide

## Prerequisites

Before running the application, ensure you have the following installed:

1. **Java 21** - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)
2. **Maven 3.6+** - Download from [Apache Maven](https://maven.apache.org/download.cgi)
3. **MongoDB 4.4+** - Download from [MongoDB](https://www.mongodb.com/try/download/community)

## Step 1: Install Java 21

### Windows
```bash
# Download and install Java 21 JDK from Oracle
# Add JAVA_HOME environment variable
# Add %JAVA_HOME%\bin to PATH

# Verify installation
java -version
```

### Linux/Mac
```bash
# Using SDKMAN
curl -s "https://get.sdkman.io" | bash
sdk install java 21.0.1-oracle

# Verify installation
java -version
```

## Step 2: Install MongoDB

### Windows
```bash
# Download MongoDB Community Server from official website
# Install as a Windows Service
# MongoDB will run on mongodb://localhost:27017 by default
```

### Linux
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Mac
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

### Verify MongoDB Installation
```bash
mongosh
# Should connect to MongoDB shell
```

## Step 3: Setup Groq API Key

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up/Login
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the API key

## Step 4: Clone and Configure Project

```bash
# Clone the repository
git clone <repository-url>
cd ai-interview-platform

# Configure application properties
cd src/main/resources
```

Edit `application.properties`:

```properties
# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/ai_interview_platform

# JWT Configuration (Change this to a secure random string)
jwt.secret=your-super-secret-key-minimum-256-bits-long-for-production-use

# File Storage Configuration (Local storage - similar to Multer)
file.upload-dir=uploads
file.base-url=http://localhost:8080/uploads

# Groq API Configuration
groq.api.key=your-groq-api-key
groq.model=llama-3.3-70b-versatile
```

## Step 5: Build the Project

```bash
# From project root directory
mvn clean install

# This will:
# - Download all dependencies
# - Compile the code
# - Run tests
# - Create executable JAR file
```

## Step 6: Run the Application

### Option 1: Using Maven
```bash
mvn spring-boot:run
```

### Option 2: Using JAR file
```bash
java -jar target/ai-interview-platform-1.0.0.jar
```

### Option 3: With Custom Properties
```bash
java -jar target/ai-interview-platform-1.0.0.jar \
  --spring.data.mongodb.uri=mongodb://localhost:27017/ai_interview \
  --groq.api.key=your-key
```

## Step 7: Verify Installation

1. **Check Application Health**
```bash
curl http://localhost:8080/actuator/health
```

Expected Response:
```json
{
  "status": "UP"
}
```

2. **Access Swagger UI**

Open browser: `http://localhost:8080/swagger-ui.html`

3. **Test Registration**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Step 8: Create Admin User

Connect to MongoDB and create an admin user:

```bash
mongosh

use ai_interview_platform

db.users.insertOne({
  "email": "admin@example.com",
  "password": "$2a$10$abcdefghijklmnopqrstuvwxyz", // Use bcrypt hash
  "firstName": "Admin",
  "lastName": "User",
  "roles": ["USER", "ADMIN"],
  "status": "ACTIVE",
  "createdAt": new Date(),
  "updatedAt": new Date(),
  "skills": []
})
```

To generate BCrypt password hash:
```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hashedPassword = encoder.encode("admin123");
        System.out.println(hashedPassword);
    }
}
```

## Troubleshooting

### Issue: MongoDB Connection Failed
**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

### Issue: Port 8080 Already in Use
**Solution:**
```bash
# Change port in application.properties
server.port=8081

# Or use command line
java -jar target/ai-interview-platform-1.0.0.jar --server.port=8081
```

### Issue: Groq API Errors
**Solution:**
- Verify API key is correct
- Check Groq API quota and limits
- Verify network connectivity to Groq API

### Issue: File Upload Fails
**Solution:**
- Check uploads directory exists and is writable
- Verify file size (max 10MB)
- Verify file type (PDF/DOCX for resumes, images for profile)
- Ensure sufficient disk space

## Development Mode

For development with hot reload:

```bash
# Using Spring Boot DevTools
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Or add to pom.xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <optional>true</optional>
</dependency>
```

## Environment Variables

Instead of editing application.properties, you can use environment variables:

### Linux/Mac
```bash
export JWT_SECRET="your-secret-key"
export FILE_UPLOAD_DIR="uploads"
export GROQ_API_KEY="your-groq-key"

mvn spring-boot:run
```

### Windows
```cmd
set JWT_SECRET=your-secret-key
set FILE_UPLOAD_DIR=uploads
set GROQ_API_KEY=your-groq-key

mvn spring-boot:run
```

## MongoDB Indexes

Create indexes for better performance:

```javascript
use ai_interview_platform

// Users
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "status": 1 })

// Interviews
db.interviews.createIndex({ "userId": 1, "status": 1 })
db.interviews.createIndex({ "startedAt": -1 })

// Questions
db.questions.createIndex({ "interviewId": 1, "questionNumber": 1 })

// Answers
db.answers.createIndex({ "interviewId": 1 })
db.answers.createIndex({ "questionId": 1 }, { unique: true })

// Notifications
db.notifications.createIndex({ "userId": 1, "createdAt": -1 })
db.notifications.createIndex({ "userId": 1, "isRead": 1 })

// Refresh Tokens
db.refresh_tokens.createIndex({ "token": 1 }, { unique: true })
db.refresh_tokens.createIndex({ "expiryDate": 1 }, { expireAfterSeconds: 0 })
```

## Logs

Application logs are stored in:
- Console output (for development)
- `logs/ai-interview-platform.log` (for production)

View logs:
```bash
tail -f logs/ai-interview-platform.log
```

## Next Steps

1. Import Postman collection from `POSTMAN_COLLECTION.json`
2. Test all API endpoints
3. Review API documentation at `http://localhost:8080/swagger-ui.html`
4. Check sample MongoDB documents in `SAMPLE_MONGODB_DOCUMENTS.md`

## Support

For issues or questions:
- Check logs for error messages
- Review MongoDB connection
- Verify all API keys are correct
- Consult README.md for detailed API documentation
