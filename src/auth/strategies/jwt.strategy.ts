import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interfaces";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

// este se usa en los provider del auth.module
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(

    // Se inyecta para poder hacer uso de la data de la base de datos
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService

  ) {
    super({
        secretOrKey: configService.get('JWT_SECRET'),
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() // This is the way to extract the token from the request, Bearer token
    })
  }

  // This method is called when the token is valid
  async validate(payload: JwtPayload): Promise<User> { // recibimos el id del payload

    const { id } = payload;

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new UnauthorizedException('Token not valid');
    }

    if (!user.isActive)
        throw new UnauthorizedException('User is not active');

    // Se añade el user a la request
    return user;
  }
}