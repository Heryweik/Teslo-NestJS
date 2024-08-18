import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [

    ConfigModule, // Import the ConfigModule to use the ConfigService

    TypeOrmModule.forFeature([User]), // Import the User entity

    // Esto para abajo es para el JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // Register the JwtModule with the secret key and the expiration time, is async because we need to get the secret key from the environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {

        // console.log('JWT Secret', configService.get('JWT_SECRET'));

        return {
          secret: process.env.JWT_SECRET, // Asi se firma el token
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),

    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: {
    //     expiresIn: '2h',
    //   }
    // })
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule], //Todo esto que se exporta se puede usar en otro modulo al usar el AuthModule
})
export class AuthModule {}
