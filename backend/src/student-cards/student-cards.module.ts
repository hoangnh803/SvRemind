import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentCardsController } from './student-cards.controller';
import { StudentCardsService } from './student-cards.service';
import { StudentCard } from './entities/student-card.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StudentCard, User])],
  controllers: [StudentCardsController],
  providers: [StudentCardsService],
})
export class StudentCardsModule {}
