import express from 'express';
import { createUrlHandler } from '../controller/url.controller';
import requireUser from '../middleware/requireUser';

const router = express.Router();

// Create a link
router.post('/url-shortener', requireUser, createUrlHandler);

export default router;
