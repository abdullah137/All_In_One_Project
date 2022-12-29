import { Request, Response, NextFunction } from 'express';
import { get } from 'lodash';
import { reIssueToken } from '../service/session.service';
import { verifyJwt } from '../utils/jwt';

const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    // check the headers authoriaztion settings
    const accessToken = get(req, 'headers.authorization', '').replace(/^Bearer\s/, '');
    const refreshToken = get(req, 'headers.x-refresh-token') as string;

    if (!accessToken) {
        return next();
    }

    // get decodec and expiry from the jwt
    const { decoded, expired } = verifyJwt(accessToken, 'ACCESS_TOKEN_PUBLIC_KEY');

    if (decoded) {
        res.locals.user = decoded;
        return next();
    }

    if (expired && refreshToken) {
        const newAccesstoken = await reIssueToken({ refreshToken });

        if (newAccesstoken) {
            res.setHeader('x-access-token', newAccesstoken);

            const result = verifyJwt(newAccesstoken as string, 'ACCESS_TOKEN_PUBLIC_KEY');

            res.locals.user = result.decoded;
            return next();
        }
    } else {
        return res.status(400).json({
            err: 'ACCESS_TOKEN_EXPRIES',
            status: false,
            message: 'Please Enter A New Access Token '
        });
    }
    return next();
};

export default deserializeUser;
