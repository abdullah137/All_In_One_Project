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

// All routes are here
app.use(router);

// Handling cors request
app.use(
    cors({
        origin(requestOrigin, callback) {
            // allow all for now
            return callback(null, true);

            // switch to this when you want to restrict the origin
            // if (requestOrigin === undefined) {
            //     return callback(null, true);
            // }
            // const o = new URL(requestOrigin);
            // // check if TLD is in the list of allowed TLDs
            // if (env.allowedTLDs.includes(o.hostname)) {
            //   return callback(null, true);
            // }
            // return callback(new Error('Not allowed by CORS'));
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
