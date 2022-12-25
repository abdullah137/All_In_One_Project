import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import logger from '../utils/logger';
import UrlModel, { UrlDocument } from '../models/url.model';
import mongoose from 'mongoose';

export async function createUrl(input: object) {
    try {
        const url = await UrlModel.create(input);

        return url;
    } catch (e: any) {
        logger.error(e.message);
    }
}

export async function findUrlInformation(urlId: string, userId: string) {
    try {
        return UrlModel.findOne({ urlId: urlId, user: new mongoose.Types.ObjectId(userId) });
    } catch (e: any) {
        logger.error(e.message);
    }
}

export async function findAndUpdateUrl(query: FilterQuery<UrlDocument>, update: UpdateQuery<UrlDocument>, options: QueryOptions) {
    return UrlModel.findOneAndUpdate(query, update, options);
}

export async function deleteUrl(query: FilterQuery<UrlDocument>) {
    return UrlModel.deleteOne(query);
}

export async function findOneUrl(dbId: string) {
    try {
        return UrlModel.findById(dbId);
    } catch (e: any) {
        logger.error(e.message);
    }
}

export async function findAllLinks(userId: string) {
    try {
        return UrlModel.find<UrlDocument>({ user: new mongoose.Types.ObjectId(userId) });
    } catch (e: any) {
        logger.error(e.messag);
    }
}
