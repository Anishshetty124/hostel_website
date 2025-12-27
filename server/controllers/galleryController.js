const Gallery = require('../models/Gallery');

// @desc    Get all images
// @route   GET /api/gallery
const getImages = async (req, res) => {
    try {
        const images = await Gallery.find().sort({ createdAt: -1 });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add image (URL)
// @route   POST /api/gallery
const addImage = async (req, res) => {
    const { imageUrl, description } = req.body;
    try {
        const image = await Gallery.create({
            imageUrl,
            description,
            uploadedBy: req.user._id
        });
        res.status(201).json(image);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getImages,
    addImage
};