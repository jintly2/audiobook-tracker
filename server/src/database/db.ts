import { Module, Global } from '@nestjs/common';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ConfigService } from '@nestjs/config';

export const DRIZZLE_DATABASE = 'DRIZZLE_DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DATABASE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): PostgresJsDatabase => {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
          throw new Error(
            'DATABASE_URL environment variable is required. Please set it in your .env file.',
          );
        }

        const queryClient = postgres(databaseUrl, {
          max: 10,
          idle_timeout: 20,
          connect_timeout: 10,
        });

        return drizzle(queryClient);
      },
    },
  ],
  exports: [DRIZZLE_DATABASE],
})
export class DatabaseModule {}
