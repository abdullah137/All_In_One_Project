import { get } from 'lodash';
import { Request, Response } from 'express';
import SessionModel, { SessionDocument } from '../models/session.model';
import { verifyJwt, signJwt } from '../utils/jwt';
import { findUser } from './user.service';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { config } from '../../config/default';

export async function createSession(userId: string, userAgent: string) {
    const session = await SessionModel.create({ user: userId, userAgent });

    return session.toJSON();
}

export async function findSessions(query: FilterQuery<SessionDocument>) {
    return SessionModel.find(query).lean();
}

export async function reIssueToken({ refreshToken }: { refreshToken: string }) {
    const { decoded } = verifyJwt(refreshToken, 'REFRESH_TOKEN_PUBLIC_KEY');

    if (!decoded || !get(decoded, 'session')) return false;

    const session = await SessionModel.findById(get(decoded, 'session'));

    if (!session || !session.valid) return false;

    const user = await findUser({ _id: session.user });

    if (!user) return false;

    const accessToken = signJwt({ ...user, session: session._id }, 'ACCESS_TOKEN_PRIVATE_KEY', { expiresIn: config.token.refresh_token_timeline });

    return accessToken;
}

export async function updateSession(query: FilterQuery<SessionDocument>, update: UpdateQuery<SessionDocument>) {
    return SessionModel.updateOne(query, update);
}
