import express from 'express';
import { createUrlHandler, retriveLink, deleteLink, getAllLinks } from '../controller/url.controller';
import requireUser from '../middleware/requireUser';

const router = express.Router();

// Create a link
router.post('/url-shortener', requireUser, createUrlHandler);

// Get All Links
router.get('/url-shortener', requireUser, getAllLinks);

// Fetch Just A Link
router.get('/url-shortner/:url', requireUser, retriveLink);

// Delete A Link
router.delete('/url-shortner/:id', requireUser, deleteLink);

export default router;
