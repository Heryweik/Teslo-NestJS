// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger'; // Se usa de swagger para que se puede ver en la documentacion, pero realmente es lo mismo que el de mapped-types
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
