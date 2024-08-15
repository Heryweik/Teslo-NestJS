
import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";


export const RawHeaders = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        // La data es todo lo que recibe el decorador
        // El contexto es el contexto de la ejecución

        const req = ctx.switchToHttp().getRequest();
        
        return req.rawHeaders;
    }
)