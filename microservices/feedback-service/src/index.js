const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();

const PORT = Number(process.env.PORT || 5007);
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_db';

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET is required for feedback-service');
    process.exit(1);
  }

  process.env.JWT_SECRET = 'dev_microservices_jwt_secret_change_me';
  console.warn('JWT_SECRET is not set. Using development fallback secret for feedback-service.');
}

app.set('trust proxy', 1);
app.use(express.json());
app.use(helmet());
app.use(compression());

app.use(
  cors({
    origin: function (origin, callback) {
      const envOrigins = process.env.CLIENT_URL
        ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
        : [];
      const allowedOrigins = [...envOrigins, 'http://localhost:5173', 'http://localhost:3000'];

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'feedback-service',
    mode: 'standalone',
    timestamp: Date.now(),
  });
});

app.use('/api/feedback', feedbackRoutes);

app.use((err, req, res, next) => {
  console.error('Feedback service error:', err.message);
  res.status(502).json({ message: 'Feedback service error', error: err.message });
});

mongoose
  .connect(dbURI)
  .then(() => {
    console.log('Feedback-service MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Feedback service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Feedback-service DB connection error:', error.message);
    process.exit(1);
  });
