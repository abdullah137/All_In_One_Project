import express from 'express';
import { config } from '../config/default';
import logger from './utils/logger';
import connectDatabase from './database/connect';
import router from './routes';

const port = config.server.port;

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.use(deserialseUser);

app.use(router);

app.listen(port, () => {
    logger.info(`App started on http://localhost:${port}`);

    connectDatabase();
});
