import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
    // check the headers authoriaztion settings
    const accessToken = (req.headers.authorization || '').replace(/^Bearer\s/, '');
    if (!accessToken) {
        return next();
    }

    const decoded = verifyJwt(accessToken, 'ACCESS_TOKEN_PRIVATE_KEY');

    if (decoded) {
        res.locals.user = decoded;
    }

    return next();
};

export default deserializeUser;
