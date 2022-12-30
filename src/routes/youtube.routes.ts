import express, { Request, Response } from 'express';
import { getyoubueLink } from '../controller/youtube.controller';

const router = express.Router();

// Youtube downloader is here
router.get('/youtube', getyoubueLink);

export default router;
