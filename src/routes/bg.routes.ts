import express, { Request, Response } from 'express';
import path from 'path';
import { RemoveBgResult, RemoveBgError, removeBackgroundFromImageFile } from 'remove.bg';
import multer from 'multer';
import requireUser from '../middleware/requireUser';

// Setting multer storage
const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, path.join(__dirname, '../public/uploads/'));
    },
    filename: function (req, file, cb) {
        let fields = file.originalname.split('.');
        let fileType = fields[fields.length - 1];
        let randName = Date.now();
        let newFileName = `${randName}.${fileType}`;
        cb(null, newFileName);
    }
});

const router = express.Router();

const upload = multer({ storage: storage });

router.post('/bg-remover', [requireUser, upload.single('uploaded_file')], (req: Request, res: Response) => {
    const outputFile = path.join(__dirname, `../public/ouputs/img-removed.png`);

    const fileBody = req.file;

    removeBackgroundFromImageFile({
        // @ts-ignore
        path: fileBody.path,
        apiKey: 'a121RPvo7PfNFLC5DRewPHcM',
        size: 'regular',
        type: 'auto',
        scale: '50%',
        outputFile
    })
        .then((result: RemoveBgResult) => {
            console.log(`File saved to ${outputFile}`);
            const base64image = result.base64img;
        })
        .catch((errors: Array<RemoveBgError>) => {
            console.log(JSON.stringify(errors));
        });
});

export default router;
