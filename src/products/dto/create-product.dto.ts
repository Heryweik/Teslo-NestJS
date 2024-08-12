import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

// COnfiguracion de como se va a ver el producto y como lo recibe el servidor
export class CreateProductDto {

    @IsString()
    @MinLength(1)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({ each: true })   // Cada uno de los elementos del array debe ser un string
    @IsArray()
    sizes: string[];

    @IsIn(['men', 'women', 'kid', 'unisex']) // El genero debe ser uno de estos
    gender: string;

    @IsString({ each: true })   // Cada uno de los elementos del array debe ser un string
    @IsArray()
    @IsOptional()
    tags?: string[];

}
