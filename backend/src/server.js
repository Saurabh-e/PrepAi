const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening on port
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
