import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, count, desc, asc, ilike, sql, gte, lte, gt } from 'drizzle-orm';
import { DRIZZLE_DATABASE } from '../../database/db';
import { audiobookRecord } from '../../database/schema';
import type {
  AudiobookRecord as ApiRecord,
  AudiobookListResponse,
  AudiobookStatsResponse,
  CreateAudiobookDto,
  UpdateAudiobookDto,
  AudiobookListParams,
  AudiobookStatus,
} from '../../types/api';

interface StatsRow {
  totalDuration: string | number | null;
  totalEpisodes: string | number | null;
  totalRecords: string | number | null;
  averageRating: string | number | null;
}

interface StatusCountRow {
  status: string;
  cnt: string | number;
}

interface ProgressRow {
  currentEpisode: number;
  totalEpisodes: number;
}

@Injectable()
export class AudiobookService {
  private readonly logger = new Logger(AudiobookService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  private toRecord(row: typeof audiobookRecord.$inferSelect): ApiRecord {
    // 数据库是 snake_case，Drizzle 映射回 camelCase
    return {
      id: row.id,
      title: row.title,
      currentEpisode: row.currentEpisode,
      totalEpisodes: row.totalEpisodes,
      durationMinutes: row.durationMinutes,
      recordDate: typeof row.recordDate === 'string'
        ? row.recordDate
        : (row.recordDate as Date).toISOString().slice(0, 10),
      rating: row.rating,
      status: row.status as AudiobookStatus,
      notes: row.notes ?? '',
      createdAt: new Date(row.createdAt).toISOString(),
      updatedAt: new Date(row.updatedAt).toISOString(),
    };
  }

  async findAll(
    params: AudiobookListParams,
    userId?: string,
  ): Promise<AudiobookListResponse> {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const sortBy = params.sortBy ?? 'recordDate';
    const sortOrder = params.sortOrder ?? 'desc';

    if (page < 1) {
      throw new BadRequestException('page 必须大于等于 1');
    }
    if (pageSize < 1 || pageSize > 100) {
      throw new BadRequestException('pageSize 必须在 1-100 之间');
    }

    const conditions = [];
    if (userId) {
      conditions.push(eq(audiobookRecord.userId, userId));
    }
    if (params.status && params.status !== 'all') {
      conditions.push(eq(audiobookRecord.status, params.status));
    }
    if (params.rating !== undefined) {
      conditions.push(eq(audiobookRecord.rating, params.rating));
    }
    if (params.search) {
      conditions.push(ilike(audiobookRecord.title, `%${params.search}%`));
    }
    if (params.dateFrom) {
      conditions.push(gte(audiobookRecord.recordDate, params.dateFrom));
    }
    if (params.dateTo) {
      conditions.push(lte(audiobookRecord.recordDate, params.dateTo));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const sortCol = sortBy === 'rating'
      ? audiobookRecord.rating
      : sortBy === 'createdAt'
      ? audiobookRecord.createdAt
      : audiobookRecord.recordDate;
    const orderFn = sortOrder === 'asc' ? asc : desc;

    const [rows, countRows] = await Promise.all([
      this.db
        .select()
        .from(audiobookRecord)
        .where(whereClause)
        .orderBy(orderFn(sortCol))
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      this.db
        .select({ count: count() })
        .from(audiobookRecord)
        .where(whereClause),
    ]);

    const total = Number(countRows[0]?.count ?? 0);
    const items: ApiRecord[] = rows.map((row) => this.toRecord(row));

    return { items, total, page, pageSize };
  }

  async findOne(id: string, userId?: string): Promise<ApiRecord> {
    const conditions = [eq(audiobookRecord.id, id)];
    if (userId) {
      conditions.push(eq(audiobookRecord.userId, userId));
    }

    const rows = await this.db
      .select()
      .from(audiobookRecord)
      .where(and(...conditions))
      .limit(1);

    if (rows.length === 0) {
      throw new NotFoundException('听书记录不存在');
    }

    return this.toRecord(rows[0]);
  }

  async create(dto: CreateAudiobookDto, userId: string): Promise<ApiRecord> {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new BadRequestException('title 不能为空');
    }

    const now = new Date();

    const rows = await this.db
      .insert(audiobookRecord)
      .values({
        title: dto.title.trim(),
        currentEpisode: dto.currentEpisode ?? 0,
        totalEpisodes: dto.totalEpisodes ?? 0,
        durationMinutes: dto.durationMinutes ?? 0,
        recordDate: dto.recordDate,
        rating: dto.rating ?? 0,
        status: dto.status ?? 'listening',
        notes: dto.notes,
        createdAt: now,
        updatedAt: now,
        userId: userId,
      })
      .returning();

    return this.toRecord(rows[0]);
  }

  async update(
    id: string,
    dto: UpdateAudiobookDto,
    userId: string,
  ): Promise<ApiRecord> {
    const patch: Partial<typeof audiobookRecord.$inferInsert> = {};

    if (dto.title !== undefined) {
      const trimmed = dto.title.trim();
      if (trimmed.length === 0) {
        throw new BadRequestException('title 不能为空');
      }
      patch.title = trimmed;
    }
    if (dto.currentEpisode !== undefined) patch.currentEpisode = dto.currentEpisode;
    if (dto.totalEpisodes !== undefined) patch.totalEpisodes = dto.totalEpisodes;
    if (dto.durationMinutes !== undefined) patch.durationMinutes = dto.durationMinutes;
    if (dto.recordDate !== undefined) patch.recordDate = dto.recordDate;
    if (dto.rating !== undefined) patch.rating = dto.rating;
    if (dto.status !== undefined) patch.status = dto.status;
    if (dto.notes !== undefined) patch.notes = dto.notes;

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('未提供可更新字段');
    }

    patch.updatedAt = new Date();

    const rows = await this.db
      .update(audiobookRecord)
      .set(patch)
      .where(and(eq(audiobookRecord.id, id), eq(audiobookRecord.userId, userId)))
      .returning();

    if (rows.length === 0) {
      throw new NotFoundException('听书记录不存在');
    }

    return this.toRecord(rows[0]);
  }

  async remove(id: string, userId: string): Promise<void> {
    const rows = await this.db
      .delete(audiobookRecord)
      .where(and(eq(audiobookRecord.id, id), eq(audiobookRecord.userId, userId)))
      .returning({ id: audiobookRecord.id });

    if (rows.length === 0) {
      throw new NotFoundException('听书记录不存在');
    }
  }

  async getStats(userId?: string): Promise<AudiobookStatsResponse> {
    const whereClause = userId ? eq(audiobookRecord.userId, userId) : undefined;

    const [aggregateRows, statusRows, progressRows] = await Promise.all([
      this.db.select({
        totalDuration: sql<number>`sum(${audiobookRecord.durationMinutes})`,
        totalEpisodes: sql<number>`sum(${audiobookRecord.currentEpisode})`,
        totalRecords: sql<number>`count(*)`,
        averageRating: sql<number>`avg(${audiobookRecord.rating})`,
      }).from(audiobookRecord).where(whereClause),
      this.db.select({
        status: audiobookRecord.status,
        cnt: sql<number>`count(*)`,
      }).from(audiobookRecord).where(whereClause).groupBy(audiobookRecord.status),
      this.db.select({
        currentEpisode: audiobookRecord.currentEpisode,
        totalEpisodes: audiobookRecord.totalEpisodes,
      }).from(audiobookRecord).where(
        whereClause
          ? and(whereClause, gt(audiobookRecord.totalEpisodes, 0))
          : gt(audiobookRecord.totalEpisodes, 0),
      ),
    ]);

    const agg = aggregateRows[0] as StatsRow | undefined;
    const totalDurationMinutes = Number(agg?.totalDuration ?? 0);
    const totalEpisodesCount = Number(agg?.totalEpisodes ?? 0);
    const totalRecords = Number(agg?.totalRecords ?? 0);
    const averageRating = Number(agg?.averageRating ?? 0);

    const statusCounts = { listening: 0, finished: 0, shelved: 0 };
    for (const row of statusRows as StatusCountRow[]) {
      if (
        row.status === 'listening' ||
        row.status === 'finished' ||
        row.status === 'shelved'
      ) {
        statusCounts[row.status as keyof typeof statusCounts] = Number(row.cnt);
      }
    }

    const progressList = progressRows as ProgressRow[];
    let overallProgress = 0;
    if (progressList.length > 0) {
      const sum = progressList.reduce((acc: number, row: ProgressRow) => {
        return acc + Math.min(row.currentEpisode / row.totalEpisodes, 1);
      }, 0);
      overallProgress = Math.round((sum / progressList.length) * 100);
    }

    return {
      totalDurationMinutes,
      totalEpisodes: totalEpisodesCount,
      totalRecords,
      averageRating: Math.round(averageRating * 10) / 10,
      statusCounts,
      overallProgress,
    };
  }
}
