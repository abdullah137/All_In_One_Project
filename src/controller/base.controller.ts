import express, { Request, Response } from 'express';

export async function homePage(req: Request, res: Response) {
    return res.json({
        msg: 'Welcome to the all in one project',
        status: 200
    });
}

export async function healthCheck(req: Request, res: Response) {
    return res.json({
        msg: 'Welcome to the all in one project',
        status: 200
    });
}
