import express, { Request, Response } from 'express';
import user from './user.routes';
import shortner from './url.routes';
import bgRemover from './bg.routes';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
    return res.json({
        msg: 'Welcome to the all in one project',
        status: 200
    });
});

// healthcheck status
router.get('/healthcheck', (req: Request, res: Response) => {
    return res.json({
        msg: 'Welcome to the all in one project',
        status: 200
    });
});

// User Routes
router.use(user);

// Url-Shorther Routes
router.use(shortner);

// Background Remover Routes
router.use(bgRemover);

export default router;
