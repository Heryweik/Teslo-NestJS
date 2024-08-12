import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity()
export class ProductImage {

    @PrimaryGeneratedColumn() // Por defecto es autoincrementable
    id: number; 

    @Column('text')
    url: string;

    @ManyToOne(
        () => Product,
        (product) => product.images, // La relacion es con el campo images
    )
    product: Product; // Relacion uno a muchos con la entidad Product

}