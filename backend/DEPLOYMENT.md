# Deployment Guide

## Deployment Options

### 1. Local Deployment

See [APPLICATION_SETUP.md](APPLICATION_SETUP.md) for detailed local setup instructions.

### 2. Traditional Server Deployment

#### Prerequisites
- Ubuntu 20.04+ or similar Linux server
- Java 21 installed
- MongoDB installed and running
- Reverse proxy (Nginx) recommended

#### Steps

1. **Transfer Application**
```bash
# Build locally
mvn clean package

# Transfer to server
scp target/ai-interview-platform-1.0.0.jar user@server:/opt/ai-interview/
```

2. **Create Systemd Service**
```bash
sudo nano /etc/systemd/system/ai-interview.service
```

Content:
```ini
[Unit]
Description=AI Interview Platform
After=syslog.target network.target

[Service]
User=appuser
Type=simple
WorkingDirectory=/opt/ai-interview
ExecStart=/usr/bin/java -jar /opt/ai-interview/ai-interview-platform-1.0.0.jar
Restart=always
RestartSec=10

Environment="JWT_SECRET=your-production-secret"
Environment="MONGODB_URI=mongodb://localhost:27017/ai_interview_platform"
Environment="CLOUDINARY_CLOUD_NAME=your-cloud"
Environment="CLOUDINARY_API_KEY=your-key"
Environment="CLOUDINARY_API_SECRET=your-secret"
Environment="GROQ_API_KEY=your-groq-key"
Environment="SPRING_PROFILES_ACTIVE=prod"

[Install]
WantedBy=multi-user.target
```

3. **Start Service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-interview
sudo systemctl start ai-interview
sudo systemctl status ai-interview
```

4. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

5. **Enable HTTPS with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 3. Cloud Deployment (AWS EC2)

#### Steps

1. **Launch EC2 Instance**
   - Instance Type: t3.medium (recommended for production)
   - OS: Ubuntu 22.04 LTS
   - Security Group: Allow ports 22, 80, 443, 8080

2. **Connect to Instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 21
sudo apt install openjdk-21-jdk -y

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install nginx -y
```

4. **Deploy Application** (Follow steps from Traditional Server Deployment)

5. **Configure MongoDB for Production**
```bash
# Edit MongoDB config
sudo nano /etc/mongod.conf

# Enable authentication (optional but recommended)
security:
  authorization: enabled
```

6. **Create MongoDB Admin User**
```javascript
mongosh

use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["root"]
})

use ai_interview_platform
db.createUser({
  user: "appuser",
  pwd: "strong-password",
  roles: [{ role: "readWrite", db: "ai_interview_platform" }]
})
```

Update connection string:
```
mongodb://appuser:strong-password@localhost:27017/ai_interview_platform
```

### 4. MongoDB Atlas (Cloud Database)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster

2. **Configure Network Access**
   - Add your server IP to IP Whitelist
   - Or add 0.0.0.0/0 (not recommended for production)

3. **Get Connection String**
```
mongodb+srv://username:password@cluster.mongodb.net/ai_interview_platform
```

4. **Update Application**
```properties
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/ai_interview_platform
```

### 5. Monitoring and Logging

#### Setup Logging
```bash
# Create log directory
sudo mkdir -p /var/log/ai-interview
sudo chown appuser:appuser /var/log/ai-interview
```

Update `application-prod.properties`:
```properties
logging.file.name=/var/log/ai-interview/application.log
logging.file.max-size=10MB
logging.file.max-history=10
```

#### Monitor with Actuator
```bash
# Health check
curl http://localhost:8080/actuator/health

# Setup cron job for health monitoring
crontab -e

# Add health check every 5 minutes
*/5 * * * * curl -f http://localhost:8080/actuator/health || systemctl restart ai-interview
```

## Performance Optimization

### 1. JVM Tuning
```bash
# Update systemd service
ExecStart=/usr/bin/java \
  -Xms512m \
  -Xmx2g \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -jar /opt/ai-interview/ai-interview-platform-1.0.0.jar
```

### 2. MongoDB Optimization
```javascript
// Create compound indexes
db.interviews.createIndex({ "userId": 1, "status": 1, "startedAt": -1 })

// Enable read preference
db.getMongo().setReadPref('secondaryPreferred')
```

### 3. Nginx Caching
```nginx
location /api/v1/dashboard {
    proxy_pass http://localhost:8080;
    proxy_cache my_cache;
    proxy_cache_valid 200 5m;
    add_header X-Cache-Status $upstream_cache_status;
}
```

## Backup and Recovery

### MongoDB Backup
```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db=ai_interview_platform --out=/backup/mongodb/$DATE

# Compress
tar -czf /backup/mongodb/backup_$DATE.tar.gz /backup/mongodb/$DATE
rm -rf /backup/mongodb/$DATE

# Cron job for daily backup
0 2 * * * /opt/scripts/mongodb-backup.sh
```

### Application Backup
```bash
# Backup uploaded files (if using local storage)
rsync -avz /opt/ai-interview/ backup-server:/backups/ai-interview/

# Backup configuration
cp /opt/ai-interview/application.properties /backup/config/
```

## Security Checklist

- [ ] Change default JWT secret to strong random string
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS only (disable HTTP)
- [ ] Implement rate limiting on APIs
- [ ] Regular security updates
- [ ] Use strong passwords for all accounts
- [ ] Enable firewall (UFW)
- [ ] Regular backup schedule
- [ ] Monitor logs for suspicious activity
- [ ] Keep API keys in environment variables, not in code

## Scaling

### Horizontal Scaling
```bash
# Run multiple instances behind load balancer
# Instance 1
java -jar app.jar --server.port=8080

# Instance 2
java -jar app.jar --server.port=8081

# Configure Nginx load balancing
upstream ai_interview {
    server localhost:8080;
    server localhost:8081;
}
```

### Vertical Scaling
- Increase EC2 instance size
- Allocate more RAM to JVM
- Upgrade MongoDB cluster tier

## Troubleshooting Deployment

### Check Application Logs
```bash
sudo journalctl -u ai-interview -f
tail -f /var/log/ai-interview/application.log
```

### Check MongoDB Status
```bash
sudo systemctl status mongod
mongosh --eval "db.serverStatus()"
```

### Check Nginx Logs
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:8080/actuator/health

# Test registration
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.com","password":"test123"}'
```

## Rollback Procedure

```bash
# Stop current version
sudo systemctl stop ai-interview

# Restore previous version
cp /backup/ai-interview-platform-previous.jar /opt/ai-interview/ai-interview-platform-1.0.0.jar

# Restore database if needed
mongorestore --db=ai_interview_platform /backup/mongodb/latest/

# Start application
sudo systemctl start ai-interview
```

## Support

For deployment issues:
1. Check application logs
2. Verify all environment variables are set
3. Confirm MongoDB is running and accessible
4. Verify API keys are valid
5. Check network connectivity
6. Review security group/firewall rules
