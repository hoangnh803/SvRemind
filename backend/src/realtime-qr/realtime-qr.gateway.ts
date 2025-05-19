/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeQrService } from './realtime-qr.service';
import { Logger } from '@nestjs/common';

interface RegisterDesktopPayload {
  sessionId: string;
}

interface SendStudentQrDataPayload {
  sessionId: string;
  qrData: string; // Assuming student QR data is a string
}

@WebSocketGateway({
  cors: {
    origin:
      'https://sv-remind-5stumm724-hoangqaz125-gmailcoms-projects.vercel.app/', // Explicitly allow frontend origin
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // namespace: 'realtime-qr', // Optional: if you want to namespace
})
export class RealtimeQrGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeQrGateway.name);

  constructor(private readonly realtimeQrService: RealtimeQrService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Session cleanup is handled by the service when the desktop client disconnects
  }

  @SubscribeMessage('registerDesktop')
  handleRegisterDesktop(
    @MessageBody() payload: RegisterDesktopPayload,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(
      `Attempting to register desktop client ${client.id} for session ${payload.sessionId}`,
    );
    this.realtimeQrService.registerDesktopClient(payload.sessionId, client);
    // Optionally send a confirmation back to the desktop client
    client.emit('desktopRegistered', { sessionId: payload.sessionId });
  }

  @SubscribeMessage('sendStudentQrData')
  handleSendStudentQrData(
    @MessageBody() payload: SendStudentQrDataPayload,
    @ConnectedSocket() client: Socket, // This is the mobile client
  ): void {
    this.logger.log(
      `Mobile client ${client.id} sending data for session ${payload.sessionId}: ${payload.qrData}`,
    );
    const success = this.realtimeQrService.forwardDataToDesktop(
      payload.sessionId,
      payload.qrData,
    );

    if (success) {
      // Notify mobile client that data was forwarded
      client.emit('dataForwarded', { status: 'success' });
    } else {
      // Notify mobile client if session was not found or data couldn't be forwarded
      client.emit('dataForwardFailed', {
        status: 'error',
        message: `Session ${payload.sessionId} not found or desktop client disconnected.`,
      });
    }
  }
}
