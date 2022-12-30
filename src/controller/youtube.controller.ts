import { Request, Response } from 'express';
import ytdl from 'ytdl-core';
import { isValidHttpUrl } from '../utils/functions';

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
