import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeddService {

  constructor(

    private readonly productService: ProductsService

  ) {}
  
  async runSeed() {

    await this.insertNewProducts();

    return 'Execute seed';
  }

  private async insertNewProducts() {
    // Primero eliminamos todos los productos
    await this.productService.deleteAllProducts();

    // Insertamos los productos
    const products = initialData.products;

    const inserPromises = []

    products.forEach(product => {
      inserPromises.push(this.productService.create(product));
    });

    await Promise.all(inserPromises); // Esperamos a que se inserten todos los productos

    return true;
  }

}
