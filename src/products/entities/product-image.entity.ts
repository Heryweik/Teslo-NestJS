import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({name: 'product_images'}) // El nombre de la tabla es product_images
export class ProductImage {

    @PrimaryGeneratedColumn() // Por defecto es autoincrementable
    id: number; 

    @Column('text')
    url: string;

    @ManyToOne(
        () => Product,
        (product) => product.images, // La relacion es con el campo images
        {
            onDelete: 'CASCADE', // Si se elimina el producto se eliminan las imagenes
        },
    )
    product: Product; // Relacion uno a muchos con la entidad Product

}