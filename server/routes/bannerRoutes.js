import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  updateBannerStatus
} from '../controllers/bannerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/banners';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

//createBanner
router.route('/').get(getBanners).post(protect, admin, createBanner);

// Public routes
router
.route('/:id')
.get('/', getBanners)
.put('/:id', protect,  updateBanner)
.delete(protect, admin, deleteBanner);



// Protected routes (Admin only)
// router.post('/', protect, admin, upload.single('image'), createBanner);
// router.put('/:id', protect, admin, upload.single('image'), updateBanner);
// router.delete('/:id', protect, admin, deleteBanner);
// router.patch('/:id/status', protect, admin, updateBannerStatus);

export default router;