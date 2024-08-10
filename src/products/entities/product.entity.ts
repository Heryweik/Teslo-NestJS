import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Esta es la representacion de la entidad producto en la base de datos
@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid') // Genera un id automatico de tipo uuid
    id: string;

    @Column('text', {
        unique: true, // No se pueden repetir los titulos
    }) 
    title: string;

    @Column('numeric', {
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

}
