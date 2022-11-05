import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlayersGateway } from './players.gateway';
import { LobbyGateway } from './lobby.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PlayersGateway, LobbyGateway],
})
export class AppModule {}
