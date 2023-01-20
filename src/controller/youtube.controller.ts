import { Request, Response } from 'express';
import ytdl from 'ytdl-core';
import { isValidHttpUrl } from '../utils/functions';
import Fs from 'fs';
import Https from 'https';

export async function getyoubueLink(req: Request, res: Response) {
    const body: { url: string } = req.body;

    // check if the string is empty
    if (body.url == '' || !body.url) {
        return res.status(400).json({
            error: 'FIELD_MISSING',
            status: false,
            message: 'Sorry, an import field is missing'
        });
    }

    // check for the validity of url
    const isValidUrl = isValidHttpUrl(body.url);
    if (!isValidUrl) {
        return res.status(400).json({
            error: 'INVALID_URL',
            status: false,
            msg: 'Sorry, Kindly Enter A Valid Url'
        });
    }

    try {
        let info = await ytdl.getInfo(body.url);

        // let videoAndAudido = ytdl.filterFormats(info.formats, 'videoandaudio');
        let audio = ytdl.filterFormats(info.formats, 'audioonly');
        let video = ytdl.filterFormats(info.formats, 'video');

        // Removed unreseraryy  the array of the audio
        let audioLinks = audio.map(function (element) {
            return { rate: element.bitrate, url: element.url, mimeType: element.mimeType, audioQuality: element.audioQuality };
        });

        let videoLinks = video.map(function (items) {
            return { url: items.url, quality: items.quality, mimeType: items.mimeType, label: items.qualityLabel };
        });

        return res.status(200).json({
            msg: 'QUERY_SUCCESSFUL',
            status: true,
            audioOnly: audioLinks,
            video: videoLinks
        });
    } catch (e: any) {
        // Get Precise Error
        const errorMessage: string = e.message;
        const split = errorMessage.split(':');

        // return a 404 error
        if (split[0] == 'No video id found') {
            return res.status(404).json({
                err: 'NO_DOWNLOADER_LINK',
                status: false,
                message: "Sorry, we couldn't find a video downloader with that link"
            });
        }

        // return an internal error
        return res.status(500).json({
            err: 'INTERNAL_ERROR',
            status: false,
            message: 'Sorry, an internal errror occured'
        });
    }
}

export async function downloadFile(req: Request, res: Response) {
    async function download(url: string, targetFile: string) {
        Https.get(url, (response) => {
            const code = response.statusCode ?? 0;

            if (code >= 400) {
                return Promise.reject(new Error(response.statusMessage));
            }

            // handle redirects
            if (code > 300 && code < 400 && !!response.headers.location) {
                return Promise.resolve(download(response.headers.location, targetFile));
            }

            // save the file to disk
            const fileWriter = Fs.createWriteStream(targetFile).on('finish', () => {
                Promise.resolve({});
            });

            response.pipe(fileWriter);
        }).on('error', (error) => {
            Promise.reject(error);
        });
    }

    const targetFile = 'audio.mp4';
    const wallpaperUrl =
        'https://rr2---sn-huoob-avns.googlevideo.com/videoplayback?expire=1673560348&ei=vCzAY4LfJ5HasALWmYmYBw&ip=102.89.42.138&id=o-ADez1D_cGkmH44rrz64wRDE38LCXFujLctx1C9m2JKl9&itag=140&source=youtube&requiressl=yes&mh=jV&mm=31%2C29&mn=sn-huoob-avns%2Csn-avn7ln7e&ms=au%2Crdu&mv=m&mvi=2&pl=24&initcwndbps=211250&vprv=1&mime=audio%2Fmp4&ns=Fu87_SnbK7puCIFJ6h0RcTwK&gir=yes&clen=11128544&dur=687.589&lmt=1673140694711466&mt=1673538316&fvip=2&keepalive=yes&fexp=24007246&c=WEB&txp=5532434&n=1jZ7AeR-ZZhrsg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&sig=AOq0QJ8wRgIhAOZEdZs-8AVMGAgTgomeL8GJxRRgW2QXHC70zWTP5XGRAiEAmFiU-gMemdgmwEKEVM6uN2BmQ0ekLqFiGpjdYd_Feg8%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRAIgbIdaf36q0mNcX2yH-yb1_V3ZZIP90EPwRqGBv4-viRACIFLNh0WJ_8aLWKpW2weKdQPCkAE6qy_AMDTMzSItaqE-';

    await download(wallpaperUrl, targetFile);
}
