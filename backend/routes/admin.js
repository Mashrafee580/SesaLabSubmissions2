import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import {
  getStats, getUsers, getUser, updateUserRole, toggleBlockUser, deleteUser,
  getPendingListings, getAllListingsAdmin, approveListing, rejectListing, hardDeleteListing,
  getAllOrders, getAllMemberships, getAllMessages,
} from '../controllers/adminController.js';
import { updateOrderStatus } from '../controllers/orderController.js';
import { createBook, updateBook, deleteBook, uploadBookCover } from '../controllers/bookController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();
const coversDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads/covers');
const imageExtensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

mkdirSync(coversDirectory, { recursive: true });

const coverUpload = multer({
  storage: multer.diskStorage({
    destination: coversDirectory,
    filename: (req, file, callback) => callback(null, `${randomUUID()}${imageExtensions[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!Object.hasOwn(imageExtensions, file.mimetype)) {
      const error = new Error('Only JPEG, PNG, and WebP cover images are allowed');
      error.statusCode = 400;
      error.isUploadError = true;
      callback(error);
      return;
    }
    callback(null, true);
  },
});

router.use(protect, adminOnly);

router.get('/stats', getStats);

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

router.get('/marketplace/pending', getPendingListings);
router.get('/marketplace', getAllListingsAdmin);
router.patch('/marketplace/:id/approve', approveListing);
router.patch('/marketplace/:id/reject', rejectListing);
router.delete('/marketplace/:id', hardDeleteListing);

router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

router.post('/uploads/cover', coverUpload.single('cover'), uploadBookCover);
router.post('/books', createBook);
router.patch('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

router.get('/memberships', getAllMemberships);
router.get('/messages', getAllMessages);

export default router;
