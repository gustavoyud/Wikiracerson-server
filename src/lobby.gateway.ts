import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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
      history: [],
    };

    // TODO: Deixar igual a nossa inspiração, pegando o lider da sala pela ordem alfabética
    this.players = [...this.players, player];
    this.emitNewPlayer();
    this.setDonoDaSala();
  }

  public handleDisconnect(client: any) {
    this.players = this.players
      .filter(({ id }) => id !== client?.id)
      .map((player, index) => ({ ...player, isDonoDaSala: index === 0 }));
    this.emitNewPlayer();
    this.setDonoDaSala();
  }

  private setDonoDaSala() {
    const player = this.players.find(({ isDonoDaSala }) => isDonoDaSala);
    this.server.to(player?.id).emit('isDonoDaSala', true);
  }

  @SubscribeMessage('getPlayers')
  public getPlayer() {
    this.emitNewPlayer();
  }

  @SubscribeMessage('gameStarted')
  public gameStarted(@MessageBody() data: any) {
    this.server.emit('gameHasStarted', data);
    this.players = this.players.map((player) => ({ ...player, history: [] }));
    this.emitNewPlayer();
  }

  private emitNewPlayer() {
    this.server.emit('currentLobby', this.players);
  }

  @SubscribeMessage('updateHistory')
  public updateHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() history: any,
  ) {
    const player: any = this.players.find(({ id }) => id === client?.id);
    player.history.push(history);
    this.emitNewPlayer();
    // if (history === articles?.title) {
    //   this.gameFinished(player);
    // }
  }

  @SubscribeMessage('hasWinner')
  public hasAWinner(@ConnectedSocket() client: Socket) {
    const player: any = this.players.find(({ id }) => id === client?.id);
    this.gameFinished(player);
  }

  private gameFinished(winner: any) {
    this.server.emit('gameHasFinished', winner);
  }
}
