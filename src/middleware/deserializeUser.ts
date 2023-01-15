import { Request, Response, NextFunction } from 'express';
import { get } from 'lodash';
import { reIssueToken, findASession } from '../service/session.service';
import { verifyJwt } from '../utils/jwt';

const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    // check the headers authoriaztion settings
    const accessToken = get(req, 'headers.authorization', '').replace(/^Bearer\s/, '');
    const refreshToken = get(req, 'headers.x-refresh-token') as string;

    if (!accessToken) {
        return next();
    }

    // get decodec and expiry from the jwt
    const { decoded, expired } = verifyJwt(accessToken, 'ACCESS_TOKEN_PUBLIC_KEY') as any;

    const session = await findASession({ id: decoded?._id });

    if (!session?.valid) {
        return next();
    }

    if (decoded) {
        // @ts-ignore
        req.user = decoded;
        return next();
    }

    if (expired && refreshToken) {
        const newAccesstoken = await reIssueToken({ refreshToken });

        if (newAccesstoken) {
            res.setHeader('x-access-token', newAccesstoken);

            const result = verifyJwt(newAccesstoken as string, 'ACCESS_TOKEN_PUBLIC_KEY');

            // @ts-ignore
            req.user = result.decoded;
            return next();
        }
    } else {
        return res.status(403).json({
            err: 'ACCESS_TOKEN_EXPRIES',
            status: false,
            message: 'Please Enter A New Access Token '
        });
    }
    return next();
};

export default deserializeUser;
