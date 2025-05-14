/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

interface ActiveSession {
  desktopSocket: Socket;
  // We might store other session-related data here if needed
}

@Injectable()
export class RealtimeQrService {
  private readonly logger = new Logger(RealtimeQrService.name);
  private activeSessions: Map<string, ActiveSession> = new Map();

  initiateSession(): { sessionId: string } {
    const sessionId = uuidv4();
    this.logger.log(`Initiated new session: ${sessionId}`);
    // We don't store the socket yet, desktop will register it
    return { sessionId };
  }

  registerDesktopClient(sessionId: string, client: Socket): void {
    if (this.activeSessions.has(sessionId)) {
      // Potentially handle re-registration or error if session already has a socket
      this.logger.warn(
        `Session ${sessionId} already has a registered desktop client. Overwriting.`,
      );
    }
    this.activeSessions.set(sessionId, { desktopSocket: client });
    this.logger.log(
      `Desktop client ${client.id} registered for session ${sessionId}`,
    );

    client.on('disconnect', () => {
      this.cleanupSession(sessionId);
    });
  }

  isSessionRegistered(sessionId: string): boolean {
    return this.activeSessions.has(sessionId);
  }

  forwardDataToDesktop(sessionId: string, data: unknown): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session && session.desktopSocket) {
      session.desktopSocket.emit('studentQrData', data);
      this.logger.log(`Forwarded data to desktop for session ${sessionId}`);
      return true;
    }
    this.logger.warn(
      `No active desktop client found for session ${sessionId} to forward data.`,
    );
    return false;
  }

  cleanupSession(sessionId: string): void {
    if (this.activeSessions.has(sessionId)) {
      this.activeSessions.delete(sessionId);
      this.logger.log(`Cleaned up session: ${sessionId}`);
    }
  }
}
