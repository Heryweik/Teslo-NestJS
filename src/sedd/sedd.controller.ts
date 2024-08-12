import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeddService } from './sedd.service';

@Controller('sedd')
export class SeddController {
  constructor(private readonly seddService: SeddService) {}

  @Get()
  executeSeed() {
    return this.seddService.runSeed();
  }
}
