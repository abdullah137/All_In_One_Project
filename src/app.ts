// Import All Required Modules
import express, { Request, Response } from 'express';
import { config } from '../config/default';
import logger from './utils/logger';
import connectDatabase from './database/connect';
import deserializeUser from './middleware/deserializeUser';
import router from './routes';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// Setting Middlewares here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(deserializeUser);

// Handling cors request
app.use(
    cors({
        origin(requestOrigin, callback) {
            // allow all for now
            return callback(null, true);
        },
        optionsSuccessStatus: 204
    })
);
app.use(
    helmet({
        frameguard: {
            action: 'deny' // change to 'sameorigin' if you want to allow iframes
        }
    })
);

// All routes are here
app.use(router);

// Error Handlers for 404
app.all('*', (req: Request, res: Response) => {
    return res.status(404).json({
        status: false,
        message: 'Sorry, the route does not exist on the server'
    });
});

const port = config.server.port;

app.listen(port, () => {
    logger.info(`App started on http://localhost:${port}`);

    connectDatabase();
});
