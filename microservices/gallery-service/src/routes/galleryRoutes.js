const express = require('express');
const multer = require('multer');

const { getGallery, uploadMedia, createMedia, deleteMedia } = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

router.get('/', getGallery);
router.post('/upload', protect, upload.single('file'), uploadMedia);
router.post('/', protect, createMedia);
router.delete('/:id', protect, deleteMedia);

module.exports = router;
