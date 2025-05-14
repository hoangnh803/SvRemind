import { Controller, Get, Logger } from '@nestjs/common';
import { RealtimeQrService } from './realtime-qr.service';

// Define a DTO for the response to ensure consistency
export class InitiateSessionResponseDto {
  sessionId: string;
  mobileScanUrl: string;
}

@Controller('realtime-qr')
export class RealtimeQrController {
  private readonly logger = new Logger(RealtimeQrController.name);

  constructor(private readonly realtimeQrService: RealtimeQrService) {}

  @Get('initiate-session')
  initiateSession(): InitiateSessionResponseDto {
    this.logger.log('Received request to initiate new QR scan session');
    const { sessionId } = this.realtimeQrService.initiateSession();

    // IMPORTANT: Replace 'http://localhost:3000' with your actual frontend URL
    // This URL will be embedded in the QR code shown on the desktop.
    // The frontend will have a route like /mobile-scan that handles this.
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'; // Default for local dev
    const mobileScanUrl = `${frontendBaseUrl}/mobile-scan?sessionId=${sessionId}`;

    this.logger.log(
      `Session ${sessionId} initiated. Mobile scan URL: ${mobileScanUrl}`,
    );
    return {
      sessionId,
      mobileScanUrl,
    };
  }
}
