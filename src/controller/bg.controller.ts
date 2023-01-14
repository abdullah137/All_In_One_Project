import path from 'path';
import { Request, Response } from 'express';
import { RemoveBgResult, RemoveBgError, removeBackgroundFromImageFile } from 'remove.bg';

export async function removeBackground(req: Request, res: Response) {
    const outputFile = path.join(__dirname, `../public/ouputs/${req.file?.filename}`);

    const fileBody = req.file;

    // Setting tthe file name here
    removeBackgroundFromImageFile({
        // @ts-ignore
        path: fileBody.path,
        apiKey: 'a121RPvo7PfNFLC5DRewPHcM',
        size: 'regular',
        type: 'auto',
        scale: 'original',
        outputFile
    })
        .then((result: RemoveBgResult) => {
            return res.status(200).json({
                msg: 'IMAGE_CONVERTED_SUCCESSFULLY',
                status: true,
                path: fileBody?.path,
                size: fileBody?.size,
                imagename: fileBody?.filename
            });
        })
        .catch((errors: Array<RemoveBgError>) => {
            console.log(JSON.stringify(errors));
        });
}

export async function donwloadImage(req: Request, res: Response) {
    res.download(path.join(__dirname, `../public/ouputs/${req.params.filename}`));
}
