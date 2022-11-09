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
  id: string;
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
      id: client.id,
      isDonoDaSala: this.players?.length === 0,
    };

    // TODO: Deixar igual a nossa inspiração, pegando o lider da sala pela ordem alfabética
    this.players = [...this.players, player];
    this.emitNewPlayers();
    this.setDonoDaSala();
  }

  public handleDisconnect(client: any) {
    this.players = this.players
      .filter(({ id }) => id !== client?.id)
      .map((player, index) => ({ ...player, isDonoDaSala: index === 0 }));
    this.getCurrentLobby();
    this.setDonoDaSala();
  }

  private setDonoDaSala() {
    const player = this.players.find(({ isDonoDaSala }) => isDonoDaSala);
    this.server.to(player?.id).emit('isDonoDaSala', true);
  }

  @SubscribeMessage('getPlayers')
  public getPlayer() {
    this.getCurrentLobby();
  }

  private getCurrentLobby() {
    this.server.emit('currentLobby', this.players);
  }

  private emitNewPlayers() {
    this.server.emit('newPlayer', this.players);
  }
}
