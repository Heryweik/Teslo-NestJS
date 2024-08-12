import { Module } from '@nestjs/common';
import { SeddService } from './sedd.service';
import { SeddController } from './sedd.controller';
import { ProductsModule } from 'src/products/products.module';

@Module({
  controllers: [SeddController],
  providers: [SeddService],
  imports: [ProductsModule], // Se importa el modulo completo no el servicio
})
export class SeddModule {}
