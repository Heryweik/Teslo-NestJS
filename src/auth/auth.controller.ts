import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { Auth, GetUser, RawHeaders } from './decorators';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';

import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { AuthService } from './auth.service';

@ApiTags('Auth') // Documentacion Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  // este endpoint es para probar si el token es valido
  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {

    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard()) // This is the guard that will protect the route whit the JWT strategy
  testingPrivateRoute(
    // @Req() request: Request, // This is the request object that will be passed to the controller
    @GetUser() user: User,
    @GetUser('email') email: string,
    @RawHeaders() rawHeaders: string[],
    // @Headers() headers: string[]
  ) {

    // console.log({user: request.user}); // This will print the user object that was decoded from the JWT token

    // console.log({user});

    return {
      ok: true,
      message: 'This is a private route',
      user,
      email,
      rawHeaders,
      // headers
    };
  }
  
  // @SetMetadata('roles', ['admin', 'super-user'])
  // ejemeplo con roles
  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      message: 'This is a private route',
      user
    };

  }

  @Get('private3')
  // @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  // @UseGuards(AuthGuard(), UserRoleGuard)
  // Se resumen estos 2 decoradores en uno solo
  @Auth(/* ValidRoles.admin */) // Cuando esta vacio se permite cualquier rol.
  privateRoute3(
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      message: 'This is a private route',
      user
    };

  }
}
