import { join } from 'path';

import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {

  getStaticProductImage(imageName: string) {

    const path = join(__dirname, '../../static/products', imageName); // Si las imagenes las tuviera en cloudinary, aquí se haría la petición a la API de Cloudinary

    if (!existsSync(path)) {
      throw new BadRequestException(`No product found with image name ${imageName}`);
    }

    return path;

  }

}
