import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ConfigModule } from '@nestjs/config';
import { TransactionsModule } from '../transactions/transactions.module'; // Import TransactionsModule

@Module({
  imports: [ConfigModule, TransactionsModule], // Thêm TransactionsModule vào imports
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
