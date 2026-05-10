//GPT.
const express = require('express');
const multer = require('multer');
const path = require('path');
const authRequired = require('../middleware/authRequired');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片或视频文件'));
    }
  }
});

// POST /uploads - upload a single file (image or video)
router.post('/', authRequired, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no_file' });
  const ext = path.extname(req.file.filename).toLowerCase();
  const isVideo = ['.mp4', '.webm', '.mov', '.avi', '.mkv'].includes(ext);
  const url = '/uploads/' + req.file.filename;
  res.json({ url, type: isVideo ? 'video' : 'image' });
});

module.exports = router;
