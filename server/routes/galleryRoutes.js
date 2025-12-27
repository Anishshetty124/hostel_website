const express = require('express');
const router = express.Router();
const { getImages, addImage } = require('../controllers/galleryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getImages);
router.post('/', protect, addImage);

module.exports = router;