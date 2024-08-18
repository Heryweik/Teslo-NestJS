import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true /* namespace: '/' */ }) // Para que no de error de CORS
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // Decorador para obtener el servidor de WebSockets
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService, // Se inyecta el servicio de JWT
  ) {}

  async handleConnection(client: Socket) {

    // El cliente trae los extra headers que se le envian desde el cliente
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload; 

    try {
      payload = this.jwtService.verify(token); // Verificar el token
      // console.log('Client connected', client.id);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();

      return;
    }

    // console.log({ payload });


    // console.log({conectados: this.messagesWsService.getConnectedClients()});

    // Emitir a todos los clientes conectados el número de clientes conectados
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected', client.id);
    this.messagesWsService.removeClient(client.id);

    // console.log({conectados: this.messagesWsService.getConnectedClients()});

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  // Este decorador se encarga de escuchar los mensajes que llegan desde el cliente
  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto) {
    // Aqui es donde se podria guardar el mensaje en la base de datos

    // emitir solo a la persona que envio el mensaje (El mismo que lo escribe)
    client.emit('message-from-yourself', {
      fullName: 'Server',
      message: payload.message || 'No message',
    });

    // Emitir a todos menos al que envio el mensaje
    client.broadcast.emit('message-from-others', {
      fullName: 'Server',
      message: payload.message || 'No message',
    });

    // Emitir a todos los clientes conectados el mensaje recibido
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'No message',
    });

    // Enviar solo a una persona o a un grupo de personas
    // this.wss.to('room1').emit('message-from-others', {});
  }
}
