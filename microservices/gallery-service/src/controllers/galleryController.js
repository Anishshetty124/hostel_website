const Gallery = require('../models/Gallery');
const ImageKit = require('imagekit');
const { redis, isRedisReady, deleteByPattern } = require('../utils/redisClient');

let imagekitClient = null;

const getImageKitClient = () => {
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    return null;
  }

  if (!imagekitClient) {
    imagekitClient = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  return imagekitClient;
};

const getGallery = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 12, 1);
    const skip = (page - 1) * limit;
    const type = req.query.type;
    const category = req.query.category;
    const cacheKey = `gallery:page:${page}:limit:${limit}:type:${type || 'all'}:category:${category || 'all'}`;

    if (isRedisReady()) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    }

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;

    const items = await Gallery.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
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

    if (isRedisReady()) {
      await redis.setex(cacheKey, 120, JSON.stringify(normalized));
    }

    return res.json(normalized);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const uploadMedia = async (req, res) => {
  try {
    const imagekit = getImageKitClient();
    if (!imagekit) {
      return res.status(503).json({ message: 'Image uploads are not configured. Missing ImageKit credentials.' });
    }

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { title, category = 'Hostel' } = req.body;
    const file = req.file;
    const type = file.mimetype.startsWith('video') ? 'video' : 'image';

    const uploadResponse = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: '/hostel_gallery',
    });

    const doc = await Gallery.create({
      type,
      mediaUrl: uploadResponse.url,
      title: title || file.originalname,
      category: category || 'Hostel',
      provider: 'imagekit',
      fileId: uploadResponse.fileId,
      uploadedBy: req.user._id,
    });

    await deleteByPattern('gallery:page:*');
    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({
      message: error.message || 'Upload failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

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
    await deleteByPattern('gallery:page:*');
    return res.status(201).json(doc);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Gallery.findById(id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    if (String(doc.uploadedBy) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    if (doc.provider === 'imagekit' && doc.fileId) {
      try {
        const imagekit = getImageKitClient();
        if (imagekit) {
          await imagekit.deleteFile(doc.fileId);
        }
      } catch (e) {
        // Ignore remote delete failure and continue DB cleanup.
      }
    }

    await doc.deleteOne();
    await deleteByPattern('gallery:page:*');
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getGallery, uploadMedia, createMedia, deleteMedia };
