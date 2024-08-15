import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeddService } from './sedd.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('sedd')
export class SeddController {
  constructor(private readonly seddService: SeddService) {}

  @Get()
  @Auth(ValidRoles.admin) // Solo los usuarios con el rol de admin pueden ejecutar el SEED
  executeSeed() {
    return this.seddService.runSeed();
  }
}
