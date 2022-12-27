import { Storage } from '@google-cloud/storage';
import { Request, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { config } from '../../config/default';
import { storageEngine } from 'multer-google-storage';

const media = ['jpg', 'png', 'jpeg', 'gif'];

type File = {
    fieldname: string;
    originalname: string;
    encodoing: string;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
};

const storage = new Storage({
    projectId: config.firebase.appId,
    keyFilename: path.resolve(config.firebase.privateKeyJson)
});

const filter = (req: Request, file: File, cb: NextFunction) => {
    if (media.includes(file.mimetype.split('/')[1])) {
        cb(null);
        return;
    } else {
        cb(new Error('Invalid file'));
        return;
    }
};

const fileSize: number = 0.5 * 1024 * 1024;

const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: fileSize
    }
});

const bucket = storage.bucket(config.firebase.bucket);

// seting up multer for form data hadling
const upload = multer({
    // storing image as buffer in memeory use in firebase
    storage: storageEngine({
        keyFilename: path.resolve(config.firebase.privateKeyJson),
        projectId: config.firebase.projectId,
        bucketId: config.firebase.bucket,
        acl: 'publicread',
        limits: {
            fileSize: fileSize
        },
        fileFilter: filter
    })
});

export { bucket };
