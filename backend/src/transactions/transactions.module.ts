import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { Transaction } from './entities/transaction.entity';
import { UsersModule } from '../users/users.module';
import { EmailTemplateModule } from '../email-templates/email-template.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    UsersModule,
    EmailTemplateModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
