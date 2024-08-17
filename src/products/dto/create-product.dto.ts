import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

// COnfiguracion de como se va a ver el producto y como lo recibe el servidor
export class CreateProductDto {

    @ApiProperty({
        description: 'Product title (unique)',
        nullable: false,
        minLength: 1,
      })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty()
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty()
    @IsString({ each: true })   // Cada uno de los elementos del array debe ser un string
    @IsArray()
    sizes: string[];

    @ApiProperty()
    @IsIn(['men', 'women', 'kid', 'unisex']) // El genero debe ser uno de estos
    gender: string;

    @ApiProperty()
    @IsString({ each: true })   // Cada uno de los elementos del array debe ser un string
    @IsArray()
    @IsOptional()
    tags?: string[];

    @ApiProperty()
    @IsString({ each: true })   // Cada uno de los elementos del array debe ser un string
    @IsArray()
    @IsOptional()
    images?: string[];

}
