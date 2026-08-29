// 共享 API 类型定义（服务端版本）
// 注意：数据库字段是 snake_case，但 API 返回保持 camelCase

export type AudiobookStatus = 'listening' | 'finished' | 'shelved';

export interface AudiobookRecord {
  id: string;
  title: string;
  currentEpisode: number;
  totalEpisodes: number;
  durationMinutes: number;
  recordDate: string;
  rating: number;
  status: AudiobookStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudiobookListResponse {
  items: AudiobookRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AudiobookStatsResponse {
  totalDurationMinutes: number;
  totalEpisodes: number;
  totalRecords: number;
  averageRating: number;
  statusCounts: {
    listening: number;
    finished: number;
    shelved: number;
  };
  overallProgress: number;
}

export interface CreateAudiobookDto {
  title: string;
  currentEpisode: number;
  totalEpisodes: number;
  durationMinutes: number;
  recordDate: string;
  rating: number;
  status: AudiobookStatus;
  notes?: string;
}

export type UpdateAudiobookDto = Partial<CreateAudiobookDto>;

export interface AudiobookListParams {
  page?: number;
  pageSize?: number;
  status?: AudiobookStatus | 'all';
  rating?: number;
  search?: string;
  sortBy?: 'recordDate' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export type RecommendationPlatform = 'missevan' | 'manbo';
export type RecommendationCategory = 'audio_drama' | 'audiobook';

export interface RecommendationItem {
  id: string;
  title: string;
  platform: RecommendationPlatform;
  category: RecommendationCategory;
  platformLabel: string;
  categoryLabel: string;
  voiceActors: string;
  originalWork: string;
  synopsis: string;
  coverUrl: string;
  sourceType: 'seed' | 'sync';
}

export interface RecommendationBatchParams {
  platform: RecommendationPlatform;
  category: RecommendationCategory;
  limit?: number;
  seed?: number;
}

export interface SyncResult {
  platform: RecommendationPlatform;
  synced: number;
  total: number;
  fromCache: boolean;
}
