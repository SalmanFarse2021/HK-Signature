import express from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import { upload, uploadAny } from '../middleware/multer.js';
import { listPublicBanners, listAdminBanners, saveBanner, deleteBanner } from '../controller/cms/bannerController.js';
import { listPublicPosts, getPublicPost, listAdminPosts, savePost, deletePost } from '../controller/cms/postController.js';
import { getPublicPage, listAdminPages, savePage } from '../controller/cms/pageController.js';
import { listMedia, uploadMedia, deleteMedia } from '../controller/cms/mediaController.js';

const router = express.Router();

// Public endpoints
router.get('/cms/banners', listPublicBanners);
router.get('/cms/posts', listPublicPosts);
router.get('/cms/posts/:idOrSlug', getPublicPost);
router.get('/cms/page/:key', getPublicPage);

// Admin: Banners
router.get('/admin/cms/banners', requireAdmin, listAdminBanners);
router.post('/admin/cms/banners', requireAdmin, upload.array('images', 6), saveBanner);
router.put('/admin/cms/banners', requireAdmin, upload.array('images', 6), saveBanner);
router.delete('/admin/cms/banners/:id', requireAdmin, deleteBanner);


// Admin: Posts
const postUploads = upload.fields([
  { name: 'cover', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
]);
router.get('/admin/cms/posts', requireAdmin, listAdminPosts);
router.post('/admin/cms/posts', requireAdmin, postUploads, savePost);
router.put('/admin/cms/posts', requireAdmin, postUploads, savePost);
router.delete('/admin/cms/posts/:id', requireAdmin, deletePost);

// Admin: Pages
router.get('/admin/cms/pages', requireAdmin, listAdminPages);
router.post('/admin/cms/pages', requireAdmin, savePage);
router.put('/admin/cms/pages', requireAdmin, savePage);

// Admin: Media (images/videos)
router.get('/admin/cms/media', requireAdmin, listMedia);
router.post('/admin/cms/media/upload', requireAdmin, uploadAny.array('files', 10), uploadMedia);
router.delete('/admin/cms/media/:id', requireAdmin, deleteMedia);

export default router;
