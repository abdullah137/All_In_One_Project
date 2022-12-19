import express, { Request, Response } from 'express';
import user from './user.routes';

const router = express.Router();

// healthcheck status
router.get('/healthcheck', (req: Request, res: Response) => {
    res.json({
        msg: 'Welcome to the all in one project',
        status: 200
    });
});

// User Routes
router.use(user);

// Url-Shorther Routes

// Background Remover Routes

export default router;
