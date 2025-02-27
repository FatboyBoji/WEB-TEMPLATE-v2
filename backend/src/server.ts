import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import budgetRoutes from './routes/budgetRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Define allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      // IP-based URLs
      'http://178.254.26.117',
      'http://178.254.26.117:55500',
      'http://178.254.26.117:55555',
      // Domain-based URLs
      'http://www.sesa-factory.eu',
      'http://www.sesa-factory.eu:55500',
      'http://www.sesa-factory.eu:55555',
      'http://sesa-factory.eu',
      'http://sesa-factory.eu:55555',
      'http://sesa-factory.eu:55500'
    ]
  : ['http://localhost:3000', 'http://localhost:3001'];

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Add a test endpoint

// Add a healthcheck route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    env: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
