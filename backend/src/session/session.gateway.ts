/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { SessionService } from './session.service';

@WebSocketGateway()
export class SessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly sessionService: SessionService) {}

  handleConnection(
    client: WebSocket & { query?: { sessionId?: string } },
    ..._args: any[]
  ) {
    const sessionId = client.query?.sessionId;
    if (sessionId && !this.sessionService.addClient(sessionId, client)) {
      client.close();
    }
  }

  handleDisconnect(client: WebSocket & { query?: { sessionId?: string } }) {
    const sessionId = client.query?.sessionId;
    if (sessionId) {
      this.sessionService.removeClient(sessionId, client);
    }
  }
}
