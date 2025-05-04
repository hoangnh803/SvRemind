import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { StudentCard } from '../student-cards/entities/student-card.entity';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transaction, StudentCard]),
    AuthModule, // Add AuthModule to imports
  ],
  controllers: [DashboardController],
  providers: [DashboardService, JwtStrategy],
})
export class DashboardModule {}
