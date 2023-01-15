import { Request, Response, NextFunction } from 'express';
const requireUser = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const user = req.user;

    if (!user) {
        return res.status(403).json({
            error: 'REQUIRE_USER_AUTHENTICATION',
            status: false,
            msg: 'Sorry, You are not authorized to access this. Kindly login'
        });
    }

    return next();
};

export default requireUser;
