import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";


export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        // La data es todo lo que recibe el decorador
        // El contexto es el contexto de la ejecución

        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if (!user) {
            throw new InternalServerErrorException('User not found');
        }

        // Si se recibe un parámetro, se retorna el valor de ese parámetro
        return data ? user[data] : user;
    }
)