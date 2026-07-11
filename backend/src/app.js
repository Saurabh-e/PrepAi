const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const errorHandler = require('./middlewares/error.middleware');

// Load environment variables from .env
dotenv.config();

const app = express();

// Parse Swagger JSON safely
let swaggerDocument = {};
try {
  swaggerDocument = require('../swagger.json');
} catch (e) {
  console.warn('Could not load swagger.json. API documentation will not be served.');
}

// CORS Configuration
const allowedOrigins = process.env.CORS_ALLOWED_ORIGIN_PATTERNS
  ? process.env.CORS_ALLOWED_ORIGIN_PATTERNS.split(',').map(p => p.trim().replace(/^['"]|['"]$/g, ''))
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://*.vercel.app',
      'https://*.onrender.com'
    ];

const allowAll = allowedOrigins.includes('*');

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or if wildcard * is allowed
    if (!origin || allowAll) return callback(null, true);
    
    // Check wildcard match (e.g. https://*.vercel.app)
    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern.includes('*')) {
        const regexStr = '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
        const regex = new RegExp(regexStr);
        return regex.test(origin);
      }
      return pattern === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`Origin blocked by CORS: ${origin}`);
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    }
  },
  credentials: true
}));

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Console logging

// Serve Swagger UI
if (Object.keys(swaggerDocument).length > 0) {
  app.use('/swagger-ui.html', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api-docs', (req, res) => res.json(swaggerDocument));
}

// Route Imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const resumeRoutes = require('./routes/resume.routes');
const interviewRoutes = require('./routes/interview.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const compilerRoutes = require('./routes/compiler.routes');
const fileRoutes = require('./routes/file.routes');

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/interviews', interviewRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/compiler', compilerRoutes);
app.use('/api/v1/files', fileRoutes);

// Actuator health check endpoint
app.get('/actuator/health', (req, res) => {
  return res.json({ status: 'UP', details: { db: 'UP' } });
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
