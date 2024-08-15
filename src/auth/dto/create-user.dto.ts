import {
  IsEmail,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  }) // Aqui se usa una expresión regular para validar que la contraseña tenga al menos una mayúscula, una minúscula y un número
//   @IsStrongPassword({
//     minLength: 6,
//     minLowercase: 1,
//     minUppercase: 1,
//     minNumbers: 1,
//     minSymbols: 0,
// })
  password: string;

  @IsString()
  @MinLength(1)
  fullName: string;
}
