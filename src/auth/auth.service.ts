import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto) {
    
    try {

      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: await bcrypt.hash(password, 10), // Se encripta la contraseña, se le puede quietar el awair y usar hashsync
      });

      await this.userRepository.save(user);
      delete user.password; // Se elimina la contraseña del objeto que se retornará

      // Se genera el token
      return {
        ...user,
        token: this.grtJwtToken({ id: user.id })
      };  
      
    } catch (error) {

      this.handleDBError(error);
      
    }

  }

  async login(loginUserDto: LoginUserDto) {
    
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ 
      where: { email },
      select: {email: true, password: true, id: true} // Se seleccionan los campos que se necesitan
     });

    if (!user) { // Si no se encuentra el usuario por email se lanza una excepción
      throw new UnauthorizedException('credentials are not valid (email)'); 
    }

    if ( !bcrypt.compareSync(password, user.password) ) { // Se compara la contraseña encriptada con la contraseña que se recibe en el body
      throw new UnauthorizedException('credentials are not valid (password)');
    }

    // Se genera el token
    return {
      ...user,
      token: this.grtJwtToken({ id: user.id })
    };

  }

  async checkAuthStatus(user: User) {
    // Se genera un nuevo token
    return {
      ...user,
      token: this.grtJwtToken({ id: user.id })
    };
  }

  private grtJwtToken(payload: JwtPayload) {
    // Aquí se debería generar el token
    const token = this.jwtService.sign(payload);
    return token;

  }

  private handleDBError(error: any): never { // El never es para indicar que la función nunca retornará un valor
    if ( error.code === '23505' ) {
      throw new BadRequestException(error.detail);
    }

    console.log(error);

    throw new InternalServerErrorException('Please check server logs');

  }

}
