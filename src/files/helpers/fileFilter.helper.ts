

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    // console.log(file);
    if (!file) return callback(new Error('File is empty'), false);

    const fileExtesion = file.mimetype.split('/')[1]; // Obtenemos la extensión del archivo, el mimetype viene en el formato image/jpg
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif']; // Definimos las extensiones válidas

    if (validExtensions.includes(fileExtesion)) { // Si la extensión del archivo es valida retornamos true
        return callback(null, true);
    }

    callback(null, false); // Si no es válida retornamos false
}