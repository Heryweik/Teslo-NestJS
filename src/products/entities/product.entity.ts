import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

// Esta es la representacion de la entidad producto en la base de datos
@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid') // Genera un id automatico de tipo uuid
    id: string;

    @Column('text', {
        unique: true, // No se pueden repetir los titulos
    }) 
    title: string;

    @Column('float', {
        default: 0, // El precio por defecto es 0
    })
    price: number;

    @Column({
        type: 'text', // El tipo de dato es texto
        nullable: true, // Puede ser nulo
    })
    decription: string;

    @Column('text', {
        unique: true, // No se pueden repetir los slugs
    })
    slug: string;

    @Column('int', {
        default: 0, // La cantidad por defecto es 0
    })
    stock: number;

    @Column('text', {
        array: true, // Es un array de texto
    })
    sizes: string[];

    @Column('text')
    gender: string; 

    @Column('text', {
        array: true, // Es un array de texto
        default: [], // Por defecto no tiene tags
    })
    tags: string[];

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product, // La relacion es con el campo product
        {
            cascade: true, // Si se elimina el producto se eliminan las imagenes
            eager: true, // Se cargan las imagenes de una vez al usar cualquier metodo de find pero no con los query builders
        }
    )
    images?: ProductImage[]; // Relacion uno a muchos con la entidad ProductImage

    @BeforeInsert() // Antes de insertar
    checkSlugInsert() {
        // Si no viene el slug, se crea uno a partir del titulo 
        if(!this.slug) {
            this.slug = this.title
        } 

        // Se convierte el slug en minusculas y se reemplazan los espacios y las comillas   
        this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
    }

    @BeforeUpdate() // Antes de actualizar
    checkSlugUpdate() {
        // Si no viene el slug, se crea uno a partir del titulo 
        if(!this.slug) {
            this.slug = this.title
        } 

        // Se convierte el slug en minusculas y se reemplazan los espacios y las comillas   
        this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
    }
}
