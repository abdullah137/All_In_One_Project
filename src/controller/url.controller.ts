import { Request, Response } from 'express';
import { createUrl, findUrlInformation, findAndUpdateUrl, deleteUrl } from '../service/url.service';
import axios, { isCancel, AxiosError } from 'axios';

type UrlInput = {
    long_url: string;
    domain?: string;
    title?: string;
    tags?: Array<string>;
};

export async function createUrlHandler(req: Request, res: Response) {
    // User Session Object
    const userId = res.locals.user._id;

    // Body Object
    const body: UrlInput = req.body;

    // destructing the body
    const { long_url, domain, title, tags } = body;

    // validation here
    if (long_url == '') {
        return res.status(400).json({
            error: 'FIELD_MISSING',
            status: false,
            msg: 'Sorry, an important field is missing'
        });
    }

    const url = await createUrl({ ...body, user: userId });

    if (url) {
        return res.status(201).json({
            msg: 'SUCCESSFULLY_INSERTED',
            status: true,
            data: url
        });
    } else {
        return res.status(500).json({
            err: 'ERROR_MSG',
            status: false,
            message: 'Sorry, an error occured'
        });
    }
}
