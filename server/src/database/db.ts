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
        const supabaseUrl = configService.get<string>('supabase.url');
        const serviceRoleKey = configService.get<string>('supabase.serviceRoleKey');

        // 从 Supabase URL 提取 Postgres 连接信息
        // Supabase URL 格式: https://<project-ref>.supabase.co
        // Postgres 连接需要单独配置，这里我们先尝试直接连接
        let databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl && supabaseUrl) {
          // 从 Supabase URL 构建默认的 Postgres URL 模式
          const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\./)?.[1];
          if (projectRef) {
            // 用户需要自己在 .env 中配置 DATABASE_URL
            // 这里只是给出一个提示性的格式
            console.warn(
              '[Database] DATABASE_URL not set. Direct Postgres connection is recommended for Drizzle.',
            );
          }
        }

        if (!databaseUrl) {
          throw new Error(
            'DATABASE_URL environment variable is required. Please set it in your .env file.',
          );
        }

        const queryClient = postgres(databaseUrl, {
          max: 10,
          idle_timeout: 20,
          connect_timeout: 10,
          // Supabase 连接必须启用 SSL
          ssl: 'require',
        });

        return drizzle(queryClient);
      },
    },
  ],
  exports: [DRIZZLE_DATABASE],
})
export class DatabaseModule {}
