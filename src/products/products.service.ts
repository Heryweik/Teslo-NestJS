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
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService'); // El logger que se encargara de mostrar los mensajes en consola

  constructor(
    // Inject the Product repository
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource, // Para el query runner
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

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ), // Llenamos la tabla de product_images con las imagenes
      }); // Create a new product
      await this.productRepository.save(product); // Save the product

      return { ...product, images: images }; // Retornamos el producto con las imagenes en un arreglo y no en un objeto.
    } catch (error) {
      this.handleDBException(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto; // Destructuring the paginationDto

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        // Se hace asi ya que es una relacion con otra tabla
        images: true, // Include the images
      },
    }); // Find all products

    // Ah esto se le llama aplanar la respuesta
    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url), // Solo retornamos las urls de las imagenes
    }));
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
      const queryBuilder = this.productRepository.createQueryBuilder('prod'); // Create a query builder, el query builder es una forma de hacer queries mas complejas en TypeORM
      product = await queryBuilder
        .where(`UPPER(title) =:title or slug =:slug`, {
          // Esta es una query en SQL
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages') // Join the images
        .getOne(); // Get the product
    }

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term); // Find the product

    return { 
      ...rest, 
      images: images.map((image) => image.url) 
    }; // Return the product
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id, // Find the product by id
      ...toUpdate,
    }); // Preload the product

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect(); // Connect to the database
    await queryRunner.startTransaction(); // Start a transaction

    try {

      if (images) {
        await queryRunner.manager.delete(ProductImage, {product: {id}}) // Se borraran todas las imagenes del producto con el id que se pasa

        // Se crean las nuevas imagenes
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ); // Create the new images
      }

      await queryRunner.manager.save(product); // Save the product

      await queryRunner.commitTransaction(); // Commit the transaction
      await queryRunner.release(); // Release the query runner

      // await this.productRepository.save(product); // Save the product
      return this.findOnePlain(id); // Con esto hacemos que se retorne el producto con las imagenes ya existentes si es que no se actualizaron

    } catch (error) {

      await queryRunner.rollbackTransaction(); // Rollback the transaction
      await queryRunner.release(); // Release the query runner  

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
