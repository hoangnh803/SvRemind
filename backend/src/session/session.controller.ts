import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  createSession() {
    const sessionId = this.sessionService.createSession();
    return { sessionId };
  }

  @Post(':sessionId/scan')
  scanUrl(@Param('sessionId') sessionId: string, @Body('url') url: string) {
    if (!url) {
      throw new HttpException('URL is required', HttpStatus.BAD_REQUEST);
    }
    const success = this.sessionService.addScannedUrl(sessionId, url);
    if (!success) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }
    return { success: true };
  }

  @Get(':sessionId/scanned-urls')
  getScannedUrls(@Param('sessionId') sessionId: string) {
    const urls = this.sessionService.getScannedUrls(sessionId);
    if (!urls) {
      throw new HttpException('Session not found', HttpStatus.NOT_FOUND);
    }
    return { urls };
  }
}
