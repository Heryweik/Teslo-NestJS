import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

// Esto podria ir en BD dependiendo de la cantidad de usuarios conectados
interface ConnectedClients {
  [id: string]: {
    socket: Socket,
    user: User,
    // desktop: boolean,
    // movil: boolean,
  };
}

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, userId: string) {

    const user = await this.userRepository.findOneBy({id: userId});

    if (!user) {
      throw new Error('User not found');
    }
    if (!user.isActive) {
      throw new Error('User not active');
    }

    this.checkUserConnection(userId);

    this.connectedClients[client.id] = {
      socket: client,
      user,
    };
  }

  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    // return Object.keys(this.connectedClients).length;

    // Devuelve un array con los ids de los clientes conectados
    return Object.keys(this.connectedClients);
  }

  getUserFullName(sockerId: string) {
    return this.connectedClients[sockerId].user.fullName;
  }

  private checkUserConnection(userId: string) {

    for (const clienId of Object.keys(this.connectedClients)) { // Object.keys(this.connectedClients) devuelve un array con las claves del objeto

      const connectedClient = this.connectedClients[clienId];

      if (connectedClient.user.id === userId) {
        connectedClient.socket.disconnect();
        break;
      }
      
    }

  }
}
