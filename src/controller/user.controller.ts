import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { omit } from 'lodash';
import { TokenExpiredError } from 'jsonwebtoken';

import { CreateUserInput, updateUserInput } from '../schema/user.schema';
import { createUser, findUser, updateProfile, findUserByUserName, findUserByEmail } from '../service/user.service';
import { signJwt } from '../utils/jwt';
import logger from '../utils/logger';
import { config } from '../../config/default';
import { findSessions, updateSession } from '../service/session.service';

export async function createUserHandler(req: Request<{}, {}, CreateUserInput['body']>, res: Response) {
    try {
        // Check if the user already exist
        const checkUserEmail = await findUserByEmail(req.body.email);

        // Check if username already exists
        const checkUserName = await findUserByUserName(req.body.username);

        // For Email Address Checking
        if (checkUserEmail) {
            return res.status(400).json({
                error: 'USER_ALREADY_EXIST',
                status: false,
                msg: 'Sorry, user already exists. Kindly Use A Email Address'
            });
        }

        // For Username Checking
        if (checkUserName) {
            return res.status(400).json({
                error: 'USER_ALREADY_EXIST',
                status: false,
                msg: 'Sorry, user already exists. Kindly Use A New Username'
            });
        }

        // Create User
        const user = await createUser(req.body);

        return res.status(200).json({
            msg: 'USER_CREATED_SUCCESSFULLY',
            status: true,
            user
        });
    } catch (e: any) {
        logger.error(e);
        return res.status(409).json({
            err: 'REQUEST_CONFLICT',
            status: false,
            message: e.message
        });
    }
}

export async function loginUserHandler(req: Request<{}, {}>, res: Response) {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                error: 'USER_NOT_FOUND',
                status: false,
                msg: 'Sorry, no user with that email address'
            });
        }

        // Check for user password
        const isValidCredentials = await user.comparePassword(password);

        if (!isValidCredentials) {
            return res.status(401).json({
                error: 'INVALID_CREDENTIALS',
                status: false,
                msg: 'Sorry, your password is incorrect'
            });
        }

        // sign a access token
        const accessToken = signJwt({ ...user }, 'ACCESS_TOKEN_PRIVATE_KEY', { expiresIn: config.token.refresh_token_timeline });

        const refreshToken = signJwt({ ...user }, 'REFRESH_TOKEN_PRIVATE_KEY', { expiresIn: config.token.refresh_token_timeline });

        return res.status(200).json({
            msg: 'LOGIN_SUCCESSFUL',
            status: true,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    } catch (e: any | TokenExpiredError) {
        const tokenExpires = new TokenExpiredError('sorry, the token has expires', new Date());
        if (e.type instanceof TokenExpiredError) {
            return res.status(403).json({
                err: 'TOKEN_EXIRES',
                status: false,
                message: tokenExpires.message
            });
        }
    }
}

export async function getUserSessionsHandler(req: Request, res: Response) {
    const userId = res.locals.user._id;

    const sessions = await findSessions({ user: userId, valid: true });

    return res.status(200).json({
        msg: 'USER_SESSIONS',
        status: 200,
        sessions
    });
}

export async function deleteSessionHandler(req: Request, res: Response) {
    const sessionId = res.locals.user.session;

    await updateSession({ _id: sessionId }, { valid: false });

    return res.status(200).json({
        msg: 'USER_LOGOUT_SUCCESSFULLY',
        status: true,
        accessToken: null,
        refreshToken: null
    });
}

export async function getUserProfile(req: Request, res: Response) {
    const user = res.locals.user;

    const username = user._doc.username;

    try {
        const userInformation = await findUser({ username: username });

        if (userInformation) {
            return res.status(200).json({
                msg: 'QUERY_SUCCESS',
                status: true,
                user: userInformation
            });
        }
    } catch (error: any) {
        logger.error(error);
        return res.status(500).json({
            error: 'INTERNAL_ERROR',
            status: false,
            message: error.message
        });
    }
}

export async function updateUserProfile(req: Request<updateUserInput['params']>, res: Response) {
    const userId = res.locals.user._doc._id;

    const body = req.body;

    try {
        // check if user canditidate exists
        const user = await findUser({ _id: userId });
        if (!user) {
            return res.status(404).json({
                err: 'USER_NOT_EXIST',
                status: false,
                message: 'Sorry, user does not exist.'
            });
        }

        const salt = await bcrypt.genSalt(config.token.salt as number);

        const hash = await bcrypt.hashSync(body.password, salt);

        // check if user email exists
        const checkEmail = await findUserByEmail(body.email);

        if (checkEmail) {
            return res.status(400).json({
                err: 'EMAIL_EXISTS',
                status: false,
                message: 'Sorry, email already exists.'
            });
        }

        const updateUser = await updateProfile({ _id: userId }, { ...body, password: hash }, { new: true });

        if (updateUser) {
            return res.status(200).json({
                query: 'PROFILE_UPDATED_SUCCESSFULLY',
                status: true,
                data: omit(updateUser, 'password')
            });
        }
    } catch (e: any) {
        return res.status(500).json({
            err: 'INTERNAL_ERROR',
            status: false,
            message: e.message
        });
    }
}
