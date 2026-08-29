import { Module } from '@nestjs/common';
import { AudiobookController } from './audiobook.controller';
import { AudiobookService } from './audiobook.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AudiobookController],
  providers: [AudiobookService],
  exports: [AudiobookService],
})
export class AudiobookModule {}
