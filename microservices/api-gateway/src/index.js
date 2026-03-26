require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const PORT = Number(process.env.PORT || 5100);
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const ROOM_SERVICE_URL = process.env.ROOM_SERVICE_URL || 'http://localhost:5002';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003';
const COMPLAINT_SERVICE_URL = process.env.COMPLAINT_SERVICE_URL || 'http://localhost:5004';
const FOOD_SERVICE_URL = process.env.FOOD_SERVICE_URL || 'http://localhost:5005';
const GALLERY_SERVICE_URL = process.env.GALLERY_SERVICE_URL || 'http://localhost:5006';
const FEEDBACK_SERVICE_URL = process.env.FEEDBACK_SERVICE_URL || 'http://localhost:5007';
const GAMES_SERVICE_URL = process.env.GAMES_SERVICE_URL || 'http://localhost:5008';
const MONOLITH_URL = process.env.MONOLITH_URL || 'http://localhost:5000';

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
    service: 'api-gateway',
    timestamp: Date.now(),
  });
});

const authProxy = createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  proxyTimeout: 10000,
});

const monolithProxy = createProxyMiddleware({
  target: MONOLITH_URL,
  changeOrigin: true,
  proxyTimeout: 10000,
});

const roomProxy = createProxyMiddleware({
  target: ROOM_SERVICE_URL,
  changeOrigin: true,
  proxyTimeout: 10000,
});

const notificationProxy = createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  proxyTimeout: 10000,
});

const complaintProxy = createProxyMiddleware({
  target: COMPLAINT_SERVICE_URL,
  changeOrigin: true,
  proxyTimeout: 10000,
});

const foodProxy = createProxyMiddleware({
  target: FOOD_SERVICE_URL,
  changeOrigin: true,
  proxyTimeout: 10000,
});

const galleryProxy = createProxyMiddleware({
  target: GALLERY_SERVICE_URL,
  changeOrigin: true,
  proxyTimeout: 10000,
});

const feedbackProxy = createProxyMiddleware({
  target: FEEDBACK_SERVICE_URL,
  changeOrigin: true,
  proxyTimeout: 10000,
});

const gamesProxy = createProxyMiddleware({
  target: GAMES_SERVICE_URL,
  changeOrigin: true,
  proxyTimeout: 10000,
});

app.use('/api/auth', authProxy);
app.use('/api/rooms', roomProxy);
app.use('/api/notifications', notificationProxy);
app.use('/api/push', notificationProxy);
app.use('/api/complaints', complaintProxy);
app.use('/api/food', foodProxy);
app.use('/api/gallery', galleryProxy);
app.use('/api/feedback', feedbackProxy);
app.use('/api/games', gamesProxy);
app.use('/api', monolithProxy);

app.use((err, req, res, next) => {
  console.error('Gateway error:', err.message);
  res.status(502).json({ message: 'Gateway error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Auth service target: ${AUTH_SERVICE_URL}`);
  console.log(`Room service target: ${ROOM_SERVICE_URL}`);
  console.log(`Notification service target: ${NOTIFICATION_SERVICE_URL}`);
  console.log(`Complaint service target: ${COMPLAINT_SERVICE_URL}`);
  console.log(`Food service target: ${FOOD_SERVICE_URL}`);
  console.log(`Gallery service target: ${GALLERY_SERVICE_URL}`);
  console.log(`Feedback service target: ${FEEDBACK_SERVICE_URL}`);
  console.log(`Games service target: ${GAMES_SERVICE_URL}`);
  console.log(`Monolith fallback target: ${MONOLITH_URL}`);
});
