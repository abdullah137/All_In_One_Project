import express, { Request, Response } from 'express';
import user from './user.routes';
import shortner from './url.routes';
import bgRemover from './bg.routes';
import youtubeDownloader from './youtube.routes';
import { homePage, healthCheck } from '../controller/base.controller';

const router = express.Router();

// Welcome Endpoint
router.get('/', homePage);

// healthcheck status
router.get('/healthcheck', healthCheck);

// User Routes
router.use(user);

// Url-Shorther Routes
router.use(shortner);

// Background Remover Routes
router.use(bgRemover);

// Youtube downloader Routes
router.use(youtubeDownloader);

export default router;
