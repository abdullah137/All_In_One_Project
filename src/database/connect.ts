import mongoose from 'mongoose';
import { config } from '../../config/default';
import logger from '../utils/logger';

async function connect() {
    const dbUri = config.mongo.url;

    try {
        await mongoose.connect(dbUri, { retryWrites: true, w: 'majority' });
        logger.info('Connected to MongoDB');
    } catch (e) {
        logger.error(e);
    }
}

export default connect;
