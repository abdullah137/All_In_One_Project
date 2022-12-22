import { Request, Response } from 'express';
import { CreateUserInput } from '../schema/user.schema';
import { createUser, findUser, findUserByEmail } from '../service/user.service';
import { signJwt } from '../utils/jwt';
import logger from '../utils/logger';
import { config } from '../../config/default';
import { findSessions, updateSession } from '../service/session.service';

export async function createUserHandler(req: Request<{}, {}, CreateUserInput['body']>, res: Response) {
    try {
        // Check if the user already exist
        const checkUser = await findUser({ email: req.body.email });

        const user = await createUser(req.body);

        if (checkUser) {
            return res.json(400).json({
                error: 'USER_ALREADY_EXIST',
                status: false,
                msg: 'Sorry, user already exists. Kindly Use A Email Address'
            });
        }

        return res.status(200).json({
            msg: 'USER_CREATED_SUCCESSFULLY',
            status: true,
            user
        });
    } catch (e: any) {
        logger.error(e);
        return res.status(409).send(e.message);
    }
}

export async function loginUserHandler(req: Request<{}, {}>, res: Response) {
    const { email, password } = req.body;

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
        accessoken: accessToken,
        refreshToken: refreshToken
    });
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
