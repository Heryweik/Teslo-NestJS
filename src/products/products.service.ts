import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { title } from 'process';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService'); // El logger que se encargara de mostrar los mensajes en consola

  constructor(
    // Inject the Product repository
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      // Si no viene el slug, se crea uno a partir del titulo
      /* if(!createProductDto.slug) {
        createProductDto.slug = createProductDto.title.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');  
      } else {
        createProductDto.slug = createProductDto.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
      } */
      // Esta logica se traslado al BeforeInsert del entity

      const product = this.productRepository.create(createProductDto); // Create a new product
      await this.productRepository.save(product); // Save the product

      return product;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto; // Destructuring the paginationDto

    return this.productRepository.find({
      take: limit,
      skip: offset,
    }); // Find all products
  }

  // Se puede buscar por el id y por el slug
  async findOne(term: string) {
    let product: Product;

    // Si el termino es un UUID
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term }); // Find one product by id
    } else {
      // product = await this.productRepository.findOneBy({slug: term}); // Find one product by slug

      // Lo que se hace aqui es como construir una query en SQL pero teniendo en cuenta que no queremos dejar vacios que proboquen inyecciones SQL
      const queryBuilder = this.productRepository.createQueryBuilder(); // Create a query builder, el query builder es una forma de hacer queries mas complejas en TypeORM
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, {
          // Esta es una query en SQL
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .getOne(); // Get the product
    }

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id, // Find the product by id
      ...updateProductDto,
    }); // Preload the product

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    try {
      await this.productRepository.save(product); // Save the product
      return product;
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async remove(id: string) {
    // Hacemos uso de la funcion findOne para buscar el producto por id
    const product = await this.findOne(id); // Find the product by id

    await this.productRepository.remove(product); // Remove the product
  }

  private handleDBException(error: any) {
    if (error.code === '23505') {
      // Error de llave duplicada
      throw new BadRequestException(error.detail);
    }

    // Manejo de errores
    this.logger.error(error); // Muestra el error en consola
    throw new InternalServerErrorException(
      'unexpected error, check server logs',
    );
  }
}
