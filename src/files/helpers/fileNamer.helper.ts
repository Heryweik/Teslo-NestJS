
import {v4 as uuid} from 'uuid'

export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    // console.log(file);
    if (!file) return callback(new Error('File is empty'), false);

    const fileExtesion = file.mimetype.split('/')[1]; // Obtenemos la extensión del archivo, el mimetype viene en el formato image/jpg

    const fileName = `${uuid()}.${fileExtesion}`; // Generamos un nombre único para el archivo


    callback(null, fileName); // Si no es válida retornamos false
}