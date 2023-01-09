import fsPromises from 'fs/promises';
import path from 'path';

const emptyFolder = async (folderPath: Array<string>) => {
    try {
        for (let i = 0; i < folderPath.length; i++) {
            // Find all files in the folder
            const files = await fsPromises.readdir(folderPath[i]);
            for (const file of files) {
                await fsPromises.unlink(path.resolve(folderPath[i], file));
                console.log(`${folderPath}/${file} has been removed successfully`);
            }
        }
    } catch (err) {
        console.log(err);
    }
};

emptyFolder(['../public/ouputs', '../public/uploads']);
