import { Request, Response } from 'express';
import { createUrl, findUrlInformation, findAllLinks, findAndUpdateUrl, deleteUrl, findOneUrl } from '../service/url.service';
import axios from 'axios';
import { config } from '../../config/default';
import mongoose, { isObjectIdOrHexString } from 'mongoose';
import { isValidHttpUrl } from '../utils/functions';

type UrlInput = {
    long_url: string;
    domain?: string;
    title?: string;
    tags?: Array<string>;
};

type BilyOutput = {
    created_at: string;
    id: string;
    link: string;
    custom_bitylinks: Array<string>;
    long_url: string;
    title: string;
    tags: Array<string>;
    deplinks: Array<string>;
    references: object;
};

export async function createUrlHandler(req: Request, res: Response) {
    // User Session Object
    const userId = res.locals.user._doc._id;

    // Body Object
    const body: UrlInput = req.body;

    // destructing the body
    const { long_url, domain, title, tags } = body;

    // Setting bityl paramaters
    const bitlyToken = config.thirdParty.bitlyAccesssToken;

    // validation here
    if (long_url == '') {
        return res.status(400).json({
            error: 'FIELD_MISSING',
            status: false,
            msg: 'Sorry, an important field is missing'
        });
    }

    // Check if the string is a valid url
    const isValidUrl = isValidHttpUrl(body.long_url);

    if (!isValidUrl) {
        return res.status(400).json({
            error: 'INVALID_URL',
            status: false,
            msg: 'Sorry, Kindly Enter A Valid Url'
        });
    }

    try {
        const generateUrl = await axios.post(
            'https://api-ssl.bitly.com/v4/bitlinks',
            {
                long_url: long_url,
                doamin: domain,
                title: title,
                tags: tags
            },
            {
                headers: {
                    Authorization: bitlyToken,
                    'content-type': 'application/json'
                }
            }
        );

        const result: BilyOutput = generateUrl.data;

        const link = result.link;

        const custom_bitlylinks = result.custom_bitylinks;

        const url = await createUrl({ ...body, link, custom_bitlylinks, user: userId });

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
    } catch (e: any) {
        console.log(e);
        return res.status(500).json({
            error: 'INTERNAL_ERPOR',
            status: false,
            message: 'Sorry, an internal error occurred. Please try again later'
        });
    }
}

export async function retriveLink(req: Request, res: Response) {
    const user = res.locals.user;

    // parms
    const url = req.params.url;
    try {
        const fetchLink = await findUrlInformation(user._doc._id, url);

        if (!fetchLink) {
            return res.status(404).json({
                err: 'NOT_FOUND',
                status: false,
                message: 'sorry, no url information found'
            });
        }

        return res.status(200).json({
            msg: 'QUERY_SUCCESSFUL',
            status: true,
            data: fetchLink
        });
    } catch (e: any) {
        console.log(e);
        return res.status(500).json({
            error: 'INTERNAL_ERPOR',
            status: false,
            message: 'Sorry, an internal error occurred. Please try again later'
        });
    }
}

export async function getAllLinks(req: Request, res: Response) {
    // Get User information
    const user = res.locals.user;

    try {
        const getLinks = (await findAllLinks(user._doc._id)) as Array<object>;

        if (getLinks.length <= 0) {
            return res.status(200).json({
                err: 'NO_LINK_FOR_USER',
                status: true,
                msg: 'Sorry, you have no links yet'
            });
        }

        return res.status(200).json({
            msg: 'QUERY_SUCCESSFUL',
            status: true,
            data: getLinks
        });
    } catch (e: any) {
        console.log(e);
        return res.status(500).json({
            error: 'INTERNAL_ERPOR',
            status: false,
            message: 'Sorry, an internal error occurred. Please try again later'
        });
    }
}

export async function deleteLink(req: Request, res: Response) {
    // User Object
    const user = res.locals.user;

    // get delete url first
    const params = req.params.id as string;

    // check if id is valid
    if (!isObjectIdOrHexString(params)) {
        return res.status(400).json({
            err: 'INVALID_ID',
            status: false,
            message: 'Sorry, id is not valid'
        });
    }

    try {
        const findUrl = await findOneUrl(params);

        if (!findUrl) {
            return res.status(404).json({
                err: 'NOT_FOUND',
                status: false,
                message: 'Sorry, Url Does Not Exist'
            });
        }

        const deleteUrlBitly = await deleteUrl({ _id: params, user: new mongoose.Types.ObjectId(user._doc._id) });

        if (deleteUrlBitly) {
            return res.status(200).json({
                msg: 'URL_DELETED',
                status: true,
                data: 'Mesage Has been deleted successfully'
            });
        } else {
            return res.status(500).json({
                err: 'UNKNOWN_ERROR',
                status: false,
                msg: 'Sorry, an unknown error occured'
            });
        }
    } catch (e: any) {
        console.log(e.message);
        return res.status(500).json({
            err: 'INTERNAL_ERROR',
            status: false,
            msg: 'Sorry, an internal error occurred'
        });
    }
}
