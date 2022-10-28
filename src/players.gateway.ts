import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PlayersGateway {
  private players = [];

  @WebSocketServer()
  server: Server;

  // Lista todos os players existentes
  @SubscribeMessage('getPlayers')
  onConnect(): any {
    return this.players;
  }
}
