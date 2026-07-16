const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

// Ensure uploads folder exists (skipped on Vercel to prevent EROFS crash)
if (!process.env.VERCEL && !fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File Filter (Images, Videos, PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, GIF, WEBP images, MP4/WEBM videos, and PDFs are allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
  fileFilter
}).single('file');

// @desc    Upload media file
// @route   POST /api/media/upload
const uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
        createdAt: new Date()
      }
    });
  });
};

// @desc    Get all uploaded media files
// @route   GET /api/media
const getMediaFiles = (req, res) => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      return res.json({ success: true, files: [] });
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    const fileList = files
      .filter(file => !file.startsWith('.'))
      .map(filename => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const stats = fs.statSync(filePath);
        const ext = path.extname(filename).toLowerCase();
        
        let fileType = 'other';
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) fileType = 'image';
        else if (['.mp4', '.webm', '.ogg'].includes(ext)) fileType = 'video';
        else if (ext === '.pdf') fileType = 'pdf';

        return {
          name: filename,
          url: `/uploads/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime,
          type: fileType
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Newest first

    res.json({ success: true, files: fileList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete media file
// @route   DELETE /api/media/:filename
const deleteMediaFile = (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Security check: ensure path is within uploads directory to prevent path traversal
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(UPLOADS_DIR);
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return res.status(400).json({ success: false, message: 'Invalid operation' });
    }

    fs.unlinkSync(filePath);
    res.json({ success: true, message: 'File deleted successfully from library' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadFile,
  getMediaFiles,
  deleteMediaFile
};
