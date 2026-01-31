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
    // Upload request received
    // File info
    // Body info
    // User info
    
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const { title, category = 'Hostel' } = req.body;
    const file = req.file;
    const type = file.mimetype.startsWith('video') ? 'video' : 'image';

    // Uploading to ImageKit
    // Upload to ImageKit
    const uploadResponse = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: '/hostel_gallery',
    });

    // ImageKit upload success

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

    // DB record created
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    // Upload error handled
    // Stack trace handled
    res.status(500).json({ message: error.message || 'Upload failed', error: process.env.NODE_ENV === 'development' ? error.stack : undefined });
  }
};

// @desc    Create media record (legacy endpoint for direct URLs)
// @route   POST /api/gallery
const createMedia = async (req, res) => {
  const { type = 'image', mediaUrl, title, category = 'Hostel', provider = 'imagekit', fileId, hash } = req.body;
  if (!mediaUrl) return res.status(400).json({ message: 'mediaUrl is required' });
  try {
    if (hash) {
      const existing = await Gallery.findOne({ hash });
      if (existing) {
        return res.status(409).json({ message: 'Duplicate image detected', data: existing });
      }
    }
    const doc = await Gallery.create({ type, mediaUrl, title, category, provider, fileId, uploadedBy: req.user?._id, hash });
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

module.exports = { getGallery, uploadMedia, createMedia, deleteMedia };