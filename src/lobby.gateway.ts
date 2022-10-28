import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

interface Player {
  meuNome: string;
  id: number;
  isDonoDaSala: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'lobby',
})
export class LobbyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private players: Player[] = [];

  @WebSocketServer()
  server: Server;

  public handleConnection(client: any) {
    const player = {
      ...client.handshake.auth,
      isDonoDaSala: this.players?.length === 0,
    };

    // TODO: Deixar igual a nossa inspiração, pegando o lider da sala pela ordem alfabética
    this.players = [...this.players, player];
    this.emitNewPlayers();

    if (player?.isDonoDaSala) {
      this.server.to(client.id).emit('isDonoDaSala', true);
    }
  }

  public handleDisconnect(client: any) {
    const player = client.handshake.auth;
    this.players = this.players.filter(({ id }) => id !== player?.id);
    this.emitNewPlayers();
  }

  @SubscribeMessage('getPlayers')
  public getPlayer() {
    this.server.emit('currentLobby', this.players);
  }

  private emitNewPlayers() {
    this.server.emit('newPlayer', this.players);
  }
}
