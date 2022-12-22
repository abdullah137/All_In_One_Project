import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import logger from '../utils/logger';
import UrlModel, { UrlDocument, UrlInput } from '../models/url.model';

export async function createUrl(input: UrlInput) {
    try {
        const url = await UrlModel.create(input);

        return url;
    } catch (e: any) {
        logger.error(e.message);
    }
}

export async function findUrlInformation(urlId: string) {
    try {
        return UrlModel.findOne({ urlId: urlId });
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
