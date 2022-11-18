import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WikiController } from './controllers/wiki/wiki.controller';
import { LobbyGateway } from './lobby.gateway';
import { PlayersGateway } from './players.gateway';

@Module({
  imports: [HttpModule],
  controllers: [AppController, WikiController],
  providers: [AppService, PlayersGateway, LobbyGateway],
})
export class AppModule {}
