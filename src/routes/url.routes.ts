import express from 'express';
import { createUrlHandler, retriveLink, deleteLink, getAllLinks } from '../controller/url.controller';
import requireUser from '../middleware/requireUser';

const router = express.Router();

// Create a link
router.post('/url-shortner', requireUser, createUrlHandler);

// Get All Links
router.get('/url-shortner', requireUser, getAllLinks);

// Fetch Just A Link
router.get('/url-shortner/:id', requireUser, retriveLink);

// Delete A Link
router.delete('/url-shortner/:id', requireUser, deleteLink);

// Update Link
router.patch('/url-shortner/:id', requireUser);

export default router;
