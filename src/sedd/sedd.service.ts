import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeddService {

  constructor(

    private readonly productService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ) {}
  
  async runSeed() {

    await this.deleteTables();

    const adminUser = await this.insertUsers();

    await this.insertNewProducts(adminUser);

    return 'Execute seed';
  }

  // Elimina todos los registros de las tablas
  private async deleteTables() {

    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
    .delete()
    .where({}) // Elimina todos los registros
    .execute();

    return true;

  }

  private async insertUsers() {

    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach(user => {
      users.push(this.userRepository.create(user))
    });

    await this.userRepository.save(users);

    return users[0] // Devolvemos el primer usuario que es el admin y es el que queda como propietario de los productos

  }

  // Inserta los productos iniciales
  private async insertNewProducts(user: User) {
    // Primero eliminamos todos los productos
    await this.productService.deleteAllProducts();

    // Insertamos los productos
    const products = initialData.products;

    const inserPromises = []

    products.forEach(product => {
      inserPromises.push(this.productService.create(product, user));
    });

    await Promise.all(inserPromises); // Esperamos a que se inserten todos los productos

    return true;
  }

}
