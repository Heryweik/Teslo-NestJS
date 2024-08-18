import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeddModule } from './sedd/sedd.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { MessagesWsModule } from './messages-ws/messages-ws.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // Configuracion de variables de entorno

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true, // Carga las entidades automaticamente
      synchronize: true, // Solo para desarrollo (crea las tablas automaticamente)
    }), ProductsModule, CommonModule, SeddModule, FilesModule,

    // Configuración de la carpeta estática
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
      }),

    AuthModule,

    MessagesWsModule 
  ],
})

export class AppModule {}
