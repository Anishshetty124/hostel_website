const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getGallery, uploadMedia, createMedia, deleteMedia, toggleLike, toggleDislike } = require('../controllers/galleryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Configure multer for memory storage with size limits
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Public: list gallery
router.get('/', getGallery);

// Protected: upload (multipart), create (legacy URL), delete
router.post('/upload', protect, upload.single('file'), uploadMedia);
router.post('/', protect, createMedia);
router.delete('/:id', protect, deleteMedia);

// Protected: like/dislike
router.post('/:id/like', protect, toggleLike);
router.post('/:id/dislike', protect, toggleDislike);

module.exports = router;