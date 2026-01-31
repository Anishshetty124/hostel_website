require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// --- Import Routes ---
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const foodRoutes = require('./routes/foodRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const gameRoutes = require('./routes/gameRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const creativeNotificationRoutes = require('./routes/creativeNotificationRoutes');
const pushRoutes = require('./routes/pushRoutes');
const creativeNotificationSettings = require('./routes/creativeNotificationSettings');

// Start notification cron jobs (creative food/game notifications)
require('./utils/notificationCron');

const app = express();

// --- Middlewares ---
app.use(express.json()); // Allow JSON data
app.use(helmet());       // Security headers
app.use(compression());  // Gzip compression for speed
app.use(cors({
    origin: function (origin, callback) {
        // Allow multiple origins from env, plus localhost for dev
        const envOrigins = process.env.CLIENT_URL
            ? process.env.CLIENT_URL.split(',').map(o => o.trim())
            : [];
        const allowedOrigins = [
            ...envOrigins,
            'http://localhost:5173',
            'http://localhost:3000'
        ];
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.warn('Blocked by CORS:', origin);
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// --- Database Connection ---
// Default to local DB if env variable is missing for dev
const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hostel_db';
mongoose.connect(dbURI)
    .then(() => {
        console.log('✅ MongoDB Connected');
    })
    .catch(err => console.error('❌ DB Connection Error:', err));

// --- Routes Usage ---
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/notifications', creativeNotificationRoutes); // Removed to prevent route conflicts
app.use('/api/user', creativeNotificationSettings);
app.use('/api/push', pushRoutes);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));