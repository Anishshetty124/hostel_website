const Gallery = require('../models/Gallery');
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// @desc    Get all media (images + videos)
// @route   GET /api/gallery
const getGallery = async (req, res) => {
    try {
        const items = await Gallery.find().sort({ createdAt: -1 });
        // Normalize legacy docs
        const normalized = items.map((i) => ({
            _id: i._id,
            type: i.type || (i.imageUrl ? 'image' : 'image'),
            mediaUrl: i.mediaUrl || i.imageUrl,
            title: i.title || i.description || 'Hostel',
            category: i.category || 'Hostel',
            uploadedBy: i.uploadedBy,
            provider: i.provider || (i.imageUrl ? 'legacy' : 'custom'),
            fileId: i.fileId || undefined,
            likes: i.likes || [],
            dislikes: i.dislikes || [],
            createdAt: i.createdAt,
        }));
        res.json(normalized);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload media to ImageKit and create DB record
// @route   POST /api/gallery/upload
// @desc    Upload media with multer (protected)
// @route   POST /api/gallery/upload
const uploadMedia = async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');
    console.log('Body:', req.body);
    console.log('User:', req.user?._id);
    
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const { title, category = 'Hostel' } = req.body;
    const file = req.file;
    const type = file.mimetype.startsWith('video') ? 'video' : 'image';

    console.log('Uploading to ImageKit...');
    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: '/hostel_gallery',
    });

    console.log('ImageKit upload success:', uploadResponse.fileId);

    // Create DB record
    const doc = await Gallery.create({
      type,
      mediaUrl: uploadResponse.url,
      title: title || file.originalname,
      category: category || 'Hostel',
      provider: 'imagekit',
      fileId: uploadResponse.fileId,
      uploadedBy: req.user._id,
    });

    console.log('DB record created:', doc._id);
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error('Upload error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: error.message || 'Upload failed', error: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
};

// @desc    Create media record (legacy endpoint for direct URLs)
// @route   POST /api/gallery
const createMedia = async (req, res) => {
    const { type = 'image', mediaUrl, title, category = 'Hostel', provider = 'imagekit', fileId } = req.body;
    if (!mediaUrl) return res.status(400).json({ message: 'mediaUrl is required' });
    try {
        const doc = await Gallery.create({ type, mediaUrl, title, category, provider, fileId, uploadedBy: req.user?._id });
        res.status(201).json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete media (admin only)
// @route   DELETE /api/gallery/:id
const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await Gallery.findById(id);
        if (!doc) return res.status(404).json({ message: 'Not found' });
        // Ownership or admin
        if (String(doc.uploadedBy) !== String(req.user._id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not allowed' });
        }
        // Delete from ImageKit if applicable
        if (doc.provider === 'imagekit' && doc.fileId) {
            try { await imagekit.deleteFile(doc.fileId); } catch (e) { /* ignore */ }
        }
        await doc.deleteOne();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle like on media
// @route   POST /api/gallery/:id/like
const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        const doc = await Gallery.findById(id);
        if (!doc) return res.status(404).json({ message: 'Not found' });
        
        const likeIndex = doc.likes.indexOf(userId);
        const dislikeIndex = doc.dislikes.indexOf(userId);
        
        // Remove from dislikes if present
        if (dislikeIndex > -1) {
            doc.dislikes.splice(dislikeIndex, 1);
        }
        
        // Toggle like
        if (likeIndex > -1) {
            doc.likes.splice(likeIndex, 1); // Unlike
        } else {
            doc.likes.push(userId); // Like
        }
        
        await doc.save();
        res.json({ 
            success: true, 
            liked: likeIndex === -1,
            likes: doc.likes.length,
            dislikes: doc.dislikes.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle dislike on media
// @route   POST /api/gallery/:id/dislike
const toggleDislike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        const doc = await Gallery.findById(id);
        if (!doc) return res.status(404).json({ message: 'Not found' });
        
        const likeIndex = doc.likes.indexOf(userId);
        const dislikeIndex = doc.dislikes.indexOf(userId);
        
        // Remove from likes if present
        if (likeIndex > -1) {
            doc.likes.splice(likeIndex, 1);
        }
        
        // Toggle dislike
        if (dislikeIndex > -1) {
            doc.dislikes.splice(dislikeIndex, 1); // Undislike
        } else {
            doc.dislikes.push(userId); // Dislike
        }
        
        await doc.save();
        res.json({ 
            success: true, 
            disliked: dislikeIndex === -1,
            likes: doc.likes.length,
            dislikes: doc.dislikes.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getGallery, uploadMedia, createMedia, deleteMedia, toggleLike, toggleDislike };