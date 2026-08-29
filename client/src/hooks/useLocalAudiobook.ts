import type {
  AudiobookRecord,
  AudiobookListParams,
  AudiobookListResponse,
  AudiobookStatsResponse,
  CreateAudiobookDto,
  UpdateAudiobookDto,
} from '@/types/api';

const STORAGE_KEY = 'audiobook_records';

function readRecords(): AudiobookRecord[] {
  const raw: string | null = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as AudiobookRecord[];
    return [];
  } catch {
    return [];
  }
}

function writeRecords(records: AudiobookRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getList(params: AudiobookListParams): Promise<AudiobookListResponse> {
  const page: number = params.page ?? 1;
  const pageSize: number = params.pageSize ?? 10;
  let records: AudiobookRecord[] = readRecords();

  if (params.status && params.status !== 'all') {
    records = records.filter((r) => r.status === params.status);
  }
  if (params.rating !== undefined) {
    records = records.filter((r) => r.rating === params.rating);
  }
  if (params.search) {
    const keyword: string = params.search.toLowerCase();
    records = records.filter((r) => r.title.toLowerCase().includes(keyword));
  }
  if (params.dateFrom) {
    records = records.filter((r) => r.recordDate >= params.dateFrom!);
  }
  if (params.dateTo) {
    records = records.filter((r) => r.recordDate <= params.dateTo!);
  }

  const sortBy: 'recordDate' | 'rating' | 'createdAt' = params.sortBy ?? 'createdAt';
  const sortOrder: 'asc' | 'desc' = params.sortOrder ?? 'desc';
  records.sort((a, b) => {
    const aVal: string | number = a[sortBy];
    const bVal: string | number = b[sortBy];
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const total: number = records.length;
  const start: number = (page - 1) * pageSize;
  const items: AudiobookRecord[] = records.slice(start, start + pageSize);

  return Promise.resolve({ items, total, page, pageSize });
}

function getStats(): Promise<AudiobookStatsResponse> {
  const records: AudiobookRecord[] = readRecords();
  const totalRecords: number = records.length;
  const totalDurationMinutes: number = records.reduce(
    (sum, r) => sum + r.durationMinutes,
    0,
  );
  const totalEpisodes: number = records.reduce(
    (sum, r) => sum + r.currentEpisode,
    0,
  );
  const ratedRecords: AudiobookRecord[] = records.filter((r) => r.rating > 0);
  const averageRating: number =
    ratedRecords.length > 0
      ? Number(
          (
            ratedRecords.reduce((sum, r) => sum + r.rating, 0) /
            ratedRecords.length
          ).toFixed(1),
        )
      : 0;

  const statusCounts = { listening: 0, finished: 0, shelved: 0 };
  for (const r of records) {
    statusCounts[r.status] += 1;
  }

  const progressRecords: AudiobookRecord[] = records.filter(
    (r) => r.totalEpisodes > 0,
  );
  const overallProgress: number =
    progressRecords.length > 0
      ? Math.round(
          progressRecords.reduce(
            (sum, r) => sum + (r.currentEpisode / r.totalEpisodes) * 100,
            0,
          ) / progressRecords.length,
        )
      : 0;

  return Promise.resolve({
    totalDurationMinutes,
    totalEpisodes,
    totalRecords,
    averageRating,
    statusCounts,
    overallProgress,
  });
}

function getById(id: string): Promise<AudiobookRecord> {
  const records: AudiobookRecord[] = readRecords();
  const found = records.find((r) => r.id === id);
  if (!found) {
    return Promise.reject(new Error('Record not found'));
  }
  return Promise.resolve(found);
}

function create(dto: CreateAudiobookDto): Promise<AudiobookRecord> {
  const records: AudiobookRecord[] = readRecords();
  const now: string = new Date().toISOString();
  const record: AudiobookRecord = {
    id: crypto.randomUUID(),
    title: dto.title,
    currentEpisode: dto.currentEpisode,
    totalEpisodes: dto.totalEpisodes,
    durationMinutes: dto.durationMinutes,
    recordDate: dto.recordDate,
    rating: dto.rating,
    status: dto.status,
    notes: dto.notes ?? '',
    createdAt: now,
    updatedAt: now,
  };
  records.unshift(record);
  writeRecords(records);
  return Promise.resolve(record);
}

function update(id: string, dto: UpdateAudiobookDto): Promise<AudiobookRecord> {
  const records: AudiobookRecord[] = readRecords();
  const index: number = records.findIndex((r) => r.id === id);
  if (index === -1) {
    return Promise.reject(new Error('Record not found'));
  }
  const updated: AudiobookRecord = {
    ...records[index],
    ...dto,
    updatedAt: new Date().toISOString(),
  };
  records[index] = updated;
  writeRecords(records);
  return Promise.resolve(updated);
}

function remove(id: string): Promise<void> {
  const records: AudiobookRecord[] = readRecords();
  const filtered: AudiobookRecord[] = records.filter((r) => r.id !== id);
  writeRecords(filtered);
  return Promise.resolve();
}

export const localAudiobookApi = {
  getList,
  getStats,
  getById,
  create,
  update,
  remove,
};
