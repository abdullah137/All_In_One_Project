import express from 'express';
import path from 'path';
import multer from 'multer';

// Import the controller needed
import { removeBackground, donwloadImage } from '../controller/bg.controller';

const router = express.Router();

// Setting multer storage
const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, path.join(__dirname, '../public/uploads/'));
    },
    filename: function (req, file, cb) {
        let randName = Date.now();
        let newFileName = `${randName}.png`;
        cb(null, newFileName);
    }
});

const upload = multer({ storage: storage });

router.post('/bg-remover', [upload.single('uploaded_file')], removeBackground);

router.get('/bg-remover/:filename', donwloadImage);

export default router;
