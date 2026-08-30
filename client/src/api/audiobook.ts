import { supabase } from '@/lib/supabase';
import type {
  AudiobookRecord,
  AudiobookListResponse,
  AudiobookStatsResponse,
  CreateAudiobookDto,
  UpdateAudiobookDto,
  AudiobookListParams,
} from '@/types/api';

/**
 * 数据库行 -> 前端记录
 */
function mapRow(row: Record<string, unknown>): AudiobookRecord {
  return {
    id: String(row.id),
    title: String(row.title),
    startEpisode: Number(row.start_episode ?? 0),
    currentEpisode: Number(row.current_episode ?? 0),
    totalEpisodes: Number(row.total_episodes ?? 0),
    durationMinutes: Number(row.duration_minutes ?? 0),
    recordDate: String(row.record_date),
    rating: Number(row.rating ?? 0),
    status: (row.status as AudiobookRecord['status']) ?? 'listening',
    notes: row.notes ? String(row.notes) : '',
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

const SORT_COLUMN: Record<string, string> = {
  recordDate: 'record_date',
  rating: 'rating',
  createdAt: 'created_at',
};

export async function getList(
  params: AudiobookListParams,
): Promise<AudiobookListResponse> {
  let query = supabase
    .schema('audiobook').from('audiobook_records')
    .select('*', { count: 'exact' });

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }
  if (params.rating !== undefined) {
    query = query.eq('rating', params.rating);
  }
  if (params.search) {
    query = query.ilike('title', `%${params.search}%`);
  }
  if (params.dateFrom) {
    query = query.gte('record_date', params.dateFrom);
  }
  if (params.dateTo) {
    query = query.lte('record_date', params.dateTo);
  }

  const sortCol = SORT_COLUMN[params.sortBy ?? 'createdAt'] ?? 'created_at';
  query = query.order(sortCol, {
    ascending: params.sortOrder === 'asc',
  });

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    items: (data ?? []).map(mapRow),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getStats(): Promise<AudiobookStatsResponse> {
  const { data, error } = await supabase
    .schema('audiobook').from('audiobook_records')
    .select('*');

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as Array<Record<string, unknown>>;

  let totalDurationMinutes = 0;
  let totalEpisodes = 0;
  let totalRecords = rows.length;
  let ratingSum = 0;
  let ratedCount = 0;
  const statusCounts = { listening: 0, finished: 0, shelved: 0 };
  const progressList: number[] = [];

  for (const row of rows) {
    totalDurationMinutes += Number(row.duration_minutes ?? 0);
    totalEpisodes += Number(row.current_episode ?? 0);
    const rating = Number(row.rating ?? 0);
    if (rating > 0) {
      ratingSum += rating;
      ratedCount += 1;
    }
    const status = row.status as keyof typeof statusCounts;
    if (status in statusCounts) statusCounts[status] += 1;

    const total = Number(row.total_episodes ?? 0);
    const current = Number(row.current_episode ?? 0);
    if (total > 0) {
      progressList.push(Math.min(current / total, 1));
    }
  }

  const averageRating =
    ratedCount > 0 ? Math.round((ratingSum / ratedCount) * 10) / 10 : 0;
  const overallProgress =
    progressList.length > 0
      ? Math.round(
          (progressList.reduce((a, b) => a + b, 0) / progressList.length) * 100,
        )
      : 0;

  return {
    totalDurationMinutes,
    totalEpisodes,
    totalRecords,
    averageRating,
    statusCounts,
    overallProgress,
  };
}

export async function getById(id: string): Promise<AudiobookRecord> {
  const { data, error } = await supabase
    .schema('audiobook').from('audiobook_records')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('记录不存在');
  return mapRow(data as Record<string, unknown>);
}

export async function create(dto: CreateAudiobookDto): Promise<AudiobookRecord> {
  // RLS 会通过 user_id 默认值 auth.uid() 自动归属当前用户
  const { data, error } = await supabase
    .schema('audiobook').from('audiobook_records')
    .insert({
      title: dto.title,
      start_episode: dto.startEpisode ?? 0,
      current_episode: dto.currentEpisode,
      total_episodes: dto.totalEpisodes,
      duration_minutes: dto.durationMinutes,
      record_date: dto.recordDate,
      rating: dto.rating,
      status: dto.status,
      notes: dto.notes ?? '',
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function update(
  id: string,
  dto: UpdateAudiobookDto,
): Promise<AudiobookRecord> {
  const patch: Record<string, unknown> = {};
  if (dto.title !== undefined) patch.title = dto.title;
  if (dto.startEpisode !== undefined) patch.start_episode = dto.startEpisode;
  if (dto.currentEpisode !== undefined) patch.current_episode = dto.currentEpisode;
  if (dto.totalEpisodes !== undefined) patch.total_episodes = dto.totalEpisodes;
  if (dto.durationMinutes !== undefined) patch.duration_minutes = dto.durationMinutes;
  if (dto.recordDate !== undefined) patch.record_date = dto.recordDate;
  if (dto.rating !== undefined) patch.rating = dto.rating;
  if (dto.status !== undefined) patch.status = dto.status;
  if (dto.notes !== undefined) patch.notes = dto.notes;

  const { data, error } = await supabase
    .schema('audiobook').from('audiobook_records')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as Record<string, unknown>);
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase
    .schema('audiobook').from('audiobook_records')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}
