import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';

import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from './helpers';
import { Response } from 'express';

@ApiTags('Files - Get and Upload') // Documentacion Swagger
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  fineProductImage(
    @Res() res: Response, // Tenemos el control total de la respuesta
    @Param('imageName') imageName: string,
  ) {

    const path = this.filesService.getStaticProductImage(imageName);

    res.sendFile(path); // Enviamos el archivo al cliente

  }

  // Todo el codigo de aqui para abajo trabajan en conjunto
  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter, // Aquí se llama a la función que se encarga de filtrar los archivos
      limits: {
        fileSize: 1024 * 1024 * 5, // Limitamos el tamaño del archivo a 5MB
      },
      storage: diskStorage({
        destination: './static/products', // Definimos la carpeta de destino de los archivos
        filename: fileNamer, // Aquí se llama a la función que se encarga de renombrar los archivos
      }),
    }),
  ) // Las intercepciones son funciones que se ejecutan antes de que lleguen a los controladores

  uploadProductImage(
    @UploadedFile() file: Express.Multer.File, // Esto viene de la librería Multer
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return { secureUrl };
  }
}
