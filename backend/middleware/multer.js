import multer from 'multer';

// In-memory storage; we upload buffers to Cloudinary
const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10,
  },
  fileFilter: imageFilter,
});

// Broader uploader for gallery (images/videos)
const anyFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Unsupported file type'));
};

export const uploadAny = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file for videos
    files: 10,
  },
  fileFilter: anyFilter,
});

export default upload;
