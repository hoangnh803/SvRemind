import { Module } from '@nestjs/common';
import { RealtimeQrController } from './realtime-qr.controller';
import { RealtimeQrGateway } from './realtime-qr.gateway';
import { RealtimeQrService } from './realtime-qr.service';

@Module({
  imports: [],
  controllers: [RealtimeQrController],
  providers: [RealtimeQrGateway, RealtimeQrService],
})
export class RealtimeQrModule {}
