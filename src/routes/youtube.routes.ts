import express, { Request, Response } from 'express';
import { getyoubueLink, downloadFile } from '../controller/youtube.controller';

const router = express.Router();

// Youtube downloader is here
router.get('/youtube', getyoubueLink);

router.get('/youtube/:link', downloadFile);

export default router;
