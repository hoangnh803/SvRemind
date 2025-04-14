import { Module } from '@nestjs/common';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { SessionGateway } from './session.gateway';

@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionGateway],
})
export class SessionModule {}
