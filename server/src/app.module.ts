import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/db';
import { AuthModule } from './auth/auth.module';
import { AudiobookModule } from './modules/audiobook/audiobook.module';
import { RecommendationModule } from './modules/recommendation/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    AudiobookModule,
    RecommendationModule,
  ],
})
export class AppModule {}
