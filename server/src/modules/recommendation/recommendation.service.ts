import {
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, sql } from 'drizzle-orm';
import { DRIZZLE_DATABASE } from '../../database/db';
import { recommendation as recTable } from '../../database/schema';
import { recommendationSeeds } from './recommendation.seed';
import type {
  RecommendationItem,
  RecommendationPlatform,
  RecommendationCategory,
} from '../../types/api';

const PLATFORM_LABEL: Record<RecommendationPlatform, string> = {
  missevan: '猫耳',
  manbo: '漫播',
};

const CATEGORY_LABEL: Record<RecommendationCategory, string> = {
  audio_drama: '广播剧',
  audiobook: '有声剧',
};

// 默认封面：用纯色渐变占位，避免外部依赖
const DEFAULT_COVER = '';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  private toItem(row: typeof recTable.$inferSelect): RecommendationItem {
    return {
      id: row.id,
      title: row.title,
      platform: row.platform as RecommendationPlatform,
      category: row.category as RecommendationCategory,
      platformLabel: PLATFORM_LABEL[row.platform as RecommendationPlatform],
      categoryLabel: CATEGORY_LABEL[row.category as RecommendationCategory],
      voiceActors: row.voiceActors ?? '',
      originalWork: row.originalWork ?? '',
      synopsis: row.synopsis ?? '',
      coverUrl: row.coverUrl ?? DEFAULT_COVER,
      sourceType: row.sourceType as 'seed' | 'sync',
    };
  }

  /**
   * 确保种子数据已写入数据库（幂等）
   */
  async ensureSeeded(): Promise<void> {
    const existing = await this.db
      .select({ title: recTable.title, platform: recTable.platform })
      .from(recTable);
    const keySet = new Set(existing.map((r) => `${r.platform}:${r.title}`));

    const toInsert = recommendationSeeds.filter(
      (s) => !keySet.has(`${s.platform}:${s.title}`),
    );

    if (toInsert.length === 0) return;

    await this.db.insert(recTable).values(
      toInsert.map((s, idx) => ({
        title: s.title,
        platform: s.platform,
        category: s.category,
        voiceActors: s.voiceActors,
        originalWork: s.originalWork,
        synopsis: s.synopsis,
        coverUrl: s.coverUrl || DEFAULT_COVER,
        sourceType: 'seed' as const,
        sortOrder: idx + 1,
      })),
    );
    this.logger.log(`Inserted ${toInsert.length} seed recommendations`);
  }

  /**
   * 随机获取一批推荐
   */
  async getBatch(
    platform: RecommendationPlatform,
    category: RecommendationCategory,
    limit = 10,
  ): Promise<RecommendationItem[]> {
    await this.ensureSeeded();

    const rows = await this.db
      .select()
      .from(recTable)
      .where(and(eq(recTable.platform, platform), eq(recTable.category, category)))
      .orderBy(sql`random()`)
      .limit(limit);

    return rows.map((r) => this.toItem(r));
  }

  /**
   * 获取全部推荐
   */
  async getAll(
    platform: RecommendationPlatform,
    category: RecommendationCategory,
  ): Promise<RecommendationItem[]> {
    await this.ensureSeeded();
    const rows = await this.db
      .select()
      .from(recTable)
      .where(and(eq(recTable.platform, platform), eq(recTable.category, category)))
      .orderBy(recTable.sortOrder, recTable.title);
    return rows.map((r) => this.toItem(r));
  }
}
