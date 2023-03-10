import express from 'express';
import user from './user.routes';
import shortner from './url.routes';
import bgRemover from './bg.routes';
import youtubeDownloader from './youtube.routes';
import { homePage } from '../controller/base.controller';

const router = express.Router();

// Welcome Endpoint
router.get('/', homePage);

// User Routes
router.use(user);

// Url-Shortner Routes
router.use(shortner);

// Background Remover Routes
router.use(bgRemover);

// Youtube downloader Routes
router.use(youtubeDownloader);

export default router;
