import { Reflector } from '@nestjs/core';

import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector // Este es el reflector que nos permitirá leer los metadatos de los decoradores
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get<string[]>(META_ROLES, context.getHandler()); // Aquí leemos los roles que se pasaron al decorador @SetMetadata('')

    if (!validRoles) return true; // Si no se pasaron roles, entonces no hay nada que validar

    if (validRoles.length === 0) return true; // Si se pasaron roles pero el arreglo está vacío, entonces no hay nada que validar

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user)
      throw new BadRequestException('User not found');

    for (const role of user.roles) {
      if (validRoles.includes(role))
        return true;
      
    }

    throw new ForbiddenException(
      `User ${user.fullName} need a valid role [${validRoles}]`
    );
  }
}
